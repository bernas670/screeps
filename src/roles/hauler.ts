import _ from "lodash";
import { Role } from ".";

function findEnergy(creep: Creep): StructureContainer | Resource {
    if (creep.memory.source) {
        const source = Game.getObjectById(creep.memory.source);
        if (source instanceof StructureContainer) return source as StructureContainer;
        if (source instanceof Resource) return source as Resource;
    }

    // get closest dropped energy if no one is already picking it up
    const reserved: Id<_HasId>[] = [];
    _.forEach(Game.creeps, (creep) => {
        if (creep.memory.source && Game.getObjectById(creep.memory.source) instanceof Resource) {
            reserved.push(creep.memory.source);
        }
    });

    const droppedEnergy = creep.room.find(FIND_DROPPED_RESOURCES, {
        filter: (resource) => (resource.resourceType === RESOURCE_ENERGY && !reserved.includes(resource.id))
    }) as Resource[];
    
    const closestDroppedEnergy = creep.pos.findClosestByPath(droppedEnergy);
    if (closestDroppedEnergy) {
        creep.memory.source = closestDroppedEnergy.id;
        return closestDroppedEnergy;
    }

    // get container with the most energy
    const containers = creep.room.find(FIND_STRUCTURES, {
        filter: (structure) => structure.structureType === STRUCTURE_CONTAINER
    }) as StructureContainer[];
    const container = _.maxBy(containers, (container) => container.store[RESOURCE_ENERGY]);

    return container ?? containers[0];
}

type EnergyStorageStructure =
    StructureSpawn |
    StructureExtension |
    StructureTower |
    StructureStorage |
    StructureContainer;

function findTarget(creep: Creep): EnergyStorageStructure | null {
    if (creep.memory.target) {
        const target = Game.getObjectById(creep.memory.target) as EnergyStorageStructure;
        if (target && target.store.getFreeCapacity(RESOURCE_ENERGY) > 0)
            return target;
    }

    // TODO: better handle the container case because it is not an owned structure
    const targetPriority: StructureConstant[][] = [
        [STRUCTURE_SPAWN, STRUCTURE_EXTENSION],
        [STRUCTURE_TOWER],
        [STRUCTURE_STORAGE],
        [STRUCTURE_CONTAINER]
    ];

    // find the closest target with the highest priority
    for (const types of targetPriority) {
        const structures = creep.room.find(FIND_STRUCTURES, {
            filter: (structure) => (
                types.includes(structure.structureType) &&
                (structure as EnergyStorageStructure).store.getFreeCapacity(RESOURCE_ENERGY) > 0
            )
        }) as EnergyStorageStructure[];
    
        const target = creep.pos.findClosestByPath(structures);
        if (target) {
            creep.memory.target = target.id;
            return target;
        }
    }

    return null;
}

enum STATE {
    COLLECTING,
    STORING,
};

const Hauler: Role = {

    run(creep: Creep) {
        if (!creep.memory.state) {
            creep.memory.state = STATE.COLLECTING;
        }

        switch (creep.memory.state) {
            case STATE.COLLECTING:
                if (creep.store.getFreeCapacity() === 0) {
                    creep.memory.source = undefined;
                    creep.memory.state = STATE.STORING;
                    break;
                }

                const energy = findEnergy(creep);

                if (
                    (energy instanceof Resource && creep.pickup(energy) === ERR_NOT_IN_RANGE) ||
                    (energy instanceof StructureContainer && creep.withdraw(energy, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE)
                ) {
                    creep.moveTo(energy, { visualizePathStyle: { stroke: "#ffaa00" } });
                }
                break;

            case STATE.STORING:
                if (creep.store[RESOURCE_ENERGY] === 0) {
                    creep.memory.state = STATE.COLLECTING;
                    creep.memory.target = undefined;
                    break;
                }

                const target = findTarget(creep);
                if (!target) break;

                if (creep.transfer(target, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
                    creep.moveTo(target, { visualizePathStyle: { stroke: "#ffffff" } });
                }
                break;
        }
    },

    spawnCap(room) {
        const sources = room.find(FIND_SOURCES);
        return Math.floor(sources.length * 1.5);
    },

    body(room: Room) {
        return [
            CARRY, CARRY, CARRY, CARRY, CARRY,    // 150
            MOVE, MOVE, MOVE, MOVE, MOVE, MOVE,   // 150
        ]
    }
};

export default Hauler;