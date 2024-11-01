import { Role } from ".";


function findStorage(creep: Creep): StructureStorage | StructureContainer | null {
    const containers = creep.room.find(FIND_STRUCTURES, {
        filter: (structure) => {
            return (
                structure instanceof StructureStorage ||
                structure instanceof StructureContainer
            ) && structure.store[RESOURCE_ENERGY] > 0;
        }
    }) as (StructureStorage | StructureContainer)[];

    if (!containers.length) return null;
    else if (containers.length === 1) return containers[0];
    return creep.pos.findClosestByPath(containers);
}

enum STATE {
    HARVESTING,
    REPAIRING
}

const Repairer: Role = {
    run(creep: Creep) {
        if (!creep.memory.state) {
            creep.memory.state = STATE.HARVESTING;
        }
        
        switch (creep.memory.state) {
            case STATE.HARVESTING:
                if (creep.store.getFreeCapacity() === 0) {
                    creep.memory.state = STATE.REPAIRING;
                    break;
                }

                const storage = findStorage(creep);
                if (!storage) break;
                
                if (creep.withdraw(storage, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
                    creep.moveTo(storage, { visualizePathStyle: { stroke: "#ffaa00" } });
                }
                break;
            case STATE.REPAIRING:
                if (creep.store[RESOURCE_ENERGY] === 0) {
                    creep.memory.state = STATE.HARVESTING;
                    break;
                }

                const repairPriority = [
                    STRUCTURE_SPAWN,
                    STRUCTURE_EXTENSION,
                    STRUCTURE_ROAD,
                    STRUCTURE_CONTAINER,
                    STRUCTURE_TOWER,
                    STRUCTURE_WALL,
                    STRUCTURE_RAMPART
                ]

                const targets = creep.room.find(FIND_STRUCTURES, {
                    filter: (structure) => (
                        !(structure instanceof StructureWall) && 
                        structure.hits < structure.hitsMax * 0.8
                    )
                });

                


                console.log("Repairer targets:");
                targets.forEach(t => console.log("    -",t.structureType, t.hits, t.hitsMax, (t.hits / t.hitsMax) * 100));

                if (targets.length) {
                    if (creep.repair(targets[0]) === ERR_NOT_IN_RANGE) {
                        creep.moveTo(targets[0], { visualizePathStyle: { stroke: "#ffffff" } });
                    }
                }
                break;
        }
    },

    spawnCap(room) {
        return 1;
    },

    body(room: Room) {
        return [
            WORK, WORK, WORK, WORK,         // 400
            CARRY, CARRY, CARRY,            // 150
            MOVE, MOVE, MOVE, MOVE, MOVE    // 150
        ]
    }
}

export default Repairer;