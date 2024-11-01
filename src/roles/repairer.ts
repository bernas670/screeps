import _ from "lodash";
import { Role } from ".";
import { log } from "console";


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

function logRepairTargets(targets: Structure[]) {
    console.log("Repairer targets:");
    for (const target of targets) {
        const percentage = target.hits / target.hitsMax * 100;
        console.log(`   - ${target.structureType}: ${percentage.toFixed(2)}% (${target.hits}/${target.hitsMax})`);
    }
}

function logRepairing(creep: Creep, target: Structure) {
    const percentage = target.hits / target.hitsMax * 100;
    console.log(`${creep.name} repairing ${target.structureType} (${percentage.toFixed(2)}%)`);
}

function findRepairTarget(creep: Creep): Structure | null {
    // first look for structures that were just built
    // TODO: maybe change this to just ramparts
    const decaying = creep.room.find(FIND_STRUCTURES, {
        filter: (structure) => (
            (structure instanceof StructureRampart || structure instanceof StructureWall)
            && structure.hits === 1
        )
    });
    if (decaying.length) {
        // find lowest health percentage structure
        logRepairTargets(decaying);
        const target2 = creep.pos.findClosestByPath(decaying) as Structure;
        creep.memory.target = target2.id;
        logRepairing(creep, target2);
        return target2;
    }

    const previousTarget = creep.memory.target ? Game.getObjectById(creep.memory.target) as Structure : null;
    if (previousTarget && previousTarget.hits < previousTarget.hitsMax) {
        return previousTarget;
    }
    creep.memory.target = undefined;

    // find closest structure below 80% (excluding walls and ramparts)
    // TODO: make sure other creeps are not already repairing this target
    const structures = creep.room.find(FIND_STRUCTURES, {
        filter: (structure) => (
            !(structure instanceof StructureWall || structure instanceof StructureRampart) &&
            structure.hits < structure.hitsMax * 0.8
        )
    });
    if (structures.length) {
        // find lowest health percentage structure
        logRepairTargets(structures);
        const target2 = _.minBy(structures, (s) => s.hits / s.hitsMax) as Structure;
        creep.memory.target = target2.id;
        logRepairing(creep, target2);
        return target2;
    }

    const ramparts = creep.room.find(FIND_MY_STRUCTURES, {
        filter: (structure) => (structure instanceof StructureRampart && structure.hits < structure.hitsMax * 0.9)
    });
    if (ramparts.length) {
        logRepairTargets(ramparts);
        const rampart = _.minBy(ramparts, (s) => s.hits / s.hitsMax) as Structure;
        creep.memory.target = rampart.id;
        logRepairing(creep, rampart);
        return rampart;
    }

    const walls = creep.room.find(FIND_STRUCTURES, {
        filter: (structure) => (structure instanceof StructureWall && structure.hits < structure.hitsMax * 0.9)
    });
    if (walls.length) {
        logRepairTargets(structures);
        const wall = _.minBy(walls, (s) => s.hits / s.hitsMax) as Structure;
        creep.memory.target = wall.id;
        logRepairing(creep, wall);
        return wall;
    }

    return null;
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
                    creep.memory.target = undefined;
                    break;
                }

                const target = findRepairTarget(creep);
                if (target) {
                    if (creep.repair(target) === ERR_NOT_IN_RANGE) {
                        creep.moveTo(target, { visualizePathStyle: { stroke: "#ffffff" } });
                    }
                }
                break;
        }
    },

    spawnCap(room) {
        return 3;
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