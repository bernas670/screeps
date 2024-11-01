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

const Builder: Role = {
    run(creep: Creep) {
        if (creep.memory.building && creep.store[RESOURCE_ENERGY] === 0) {
            creep.memory.building = false;
            creep.say("🔄 harvest");
        }
        if (!creep.memory.building && creep.store.getFreeCapacity() === 0) {
            creep.memory.building = true;
            creep.say("🚧 build");
        }

        if (creep.memory.building) {
            const site = creep.pos.findClosestByPath(FIND_CONSTRUCTION_SITES);
            if (site) {
                if (creep.build(site) === ERR_NOT_IN_RANGE) {
                    creep.moveTo(site, { visualizePathStyle: { stroke: "#ffffff" } });
                }
            }
        } else {
            const storage = findStorage(creep);
            if (storage) {
                if (creep.withdraw(storage, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
                    creep.moveTo(storage, { visualizePathStyle: { stroke: "#ffaa00" } });
                }
            }
        }
    },
    
    spawnCap(room) {
        const maxBuilders = 2;

        const sites = room.find(FIND_CONSTRUCTION_SITES);
        const progressLeft = sites.reduce((total, site) => total + (site.progressTotal - site.progress), 0);
        const builders = Math.ceil(progressLeft / 1500);

        return Math.min(builders, maxBuilders);
    },

    body(room: Room) {
        return [
            WORK, WORK, WORK, WORK,         // 400
            CARRY, CARRY, CARRY,            // 150
            MOVE, MOVE, MOVE, MOVE, MOVE    // 150
        ]
    },
}

export default Builder;