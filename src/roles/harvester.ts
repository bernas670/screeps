import _ from "lodash";
import { Role } from ".";

enum STATE {
    HARVESTING,
    STORING,
    UPGRADING,
};

function findSource(creep: Creep): Source {
    if (creep.memory.source) {
        const source = Game.getObjectById(creep.memory.source);
        if (source) return source as Source;
    }

    const sources = creep.room.find(FIND_SOURCES).map(source => source.id);
    const counter = sources.reduce((acc: Record<Id<Source>, number>, source) => {
        acc[source] = 0;
        return acc;
    }, {});
    const creepSources = _.map(Game.creeps, (creep) => creep.memory.source) as Id<Source>[];
    creepSources.forEach(source => {
        if (source && sources.includes(source as Id<Source>))
            counter[source]++;
    });

    const leastUsedSource = _.minBy(Object.keys(counter) as Id<Source>[], (source: Id<Source>) => counter[source]) as Id<Source>;
    const source = Game.getObjectById(leastUsedSource) as Source;
    creep.memory.source = source.id;
    
    return source;
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
                if (creep.store[RESOURCE_ENERGY] === 0) {
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
                if (creep.store[RESOURCE_ENERGY] === 0) {
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
    },

    body(room: Room) {
        return [
            WORK, WORK, WORK, WORK,         // 400
            CARRY, CARRY, CARRY,            // 150
            MOVE, MOVE, MOVE, MOVE, MOVE    // 150
        ]
    }
};

export default Harvester;