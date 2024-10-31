import { Role, RoleLabel } from ".";

enum STATE {
    HARVESTING,
    STORING,
    UPGRADING,
};

const Harvester: Role = {
    
    run(creep: Creep) {
        if (!creep.memory.state) {
            creep.memory.state = STATE.HARVESTING;
        }

        switch (creep.memory.state) {
            case STATE.HARVESTING:
                if (creep.store.getFreeCapacity() === 0) {
                    creep.memory.state = STATE.STORING;
                    break;
                }

                const source = findSource(creep);
                if (creep.harvest(source) === ERR_NOT_IN_RANGE) {
                    creep.moveTo(source, { visualizePathStyle: { stroke: "#ffaa00" } });
                }
                break;
            case STATE.STORING:
                if (creep.store.getFreeCapacity() > 0) {
                    creep.memory.state = STATE.HARVESTING;
                    creep.memory.target = undefined;
                    break;
                }

                const target = findTarget(creep);
                if (!target) {
                    creep.memory.state = STATE.UPGRADING;
                    break;
                }

                if (creep.transfer(target, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
                    creep.moveTo(target, { visualizePathStyle: { stroke: "#ffffff" } });
                }
                break;

            case STATE.UPGRADING:
                if (creep.store.getFreeCapacity() > 0) {
                    creep.memory.state = STATE.HARVESTING;
                    creep.memory.target = undefined;
                    break;
                }

                const controller = creep.room.controller;
                if (controller) {
                    if (creep.upgradeController(controller) === ERR_NOT_IN_RANGE) {
                        creep.moveTo(controller, { visualizePathStyle: { stroke: "#ffffff" } });
                    }
                }
                break
        }
    },

    spawnCap(room) {
        const sources = room.find(FIND_SOURCES);
        return sources.length * 4;
    }
};

function findSource(creep: Creep): Source {
    if (creep.memory.source) {
        const source = Game.getObjectById(creep.memory.source);
        if (source) return source;
    }

    const sources = creep.room.find(FIND_SOURCES);
    const randomIndex = Math.floor(Math.random() * sources.length);
    const source = sources[randomIndex];
    
    creep.memory.source = source.id;

    return source;
}

type EnergyStorageStructure = 
    StructureSpawn |
    StructureExtension |
    StructureTower |
    StructureStorage |
    StructureContainer;

function isEnergyStorageStructure(structure: Structure): structure is EnergyStorageStructure {
    return (
        structure instanceof StructureSpawn ||
        structure instanceof StructureExtension ||
        structure instanceof StructureTower ||
        structure instanceof StructureStorage ||
        structure instanceof StructureContainer
    );
}

function findTarget(creep: Creep): EnergyStorageStructure | null {
    if (creep.memory.target) {
        const target = Game.getObjectById(creep.memory.target) as EnergyStorageStructure;
        if (target && target.store.getFreeCapacity(RESOURCE_ENERGY) > 0)
            return target;
    }

    const targets = creep.room.find(FIND_STRUCTURES, {
        filter: (structure) => {
            return isEnergyStorageStructure(structure) 
                && structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0;
        }
    }) as EnergyStorageStructure[];
    const target = creep.pos.findClosestByPath(targets);

    creep.memory.target = target?.id;
    return target;
}

export default Harvester;