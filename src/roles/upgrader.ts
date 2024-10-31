let roleUpgrader: {
    run(creep: Creep): void,
    spawnCap(room: Room): number
}

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


export default roleUpgrader = {
    run(creep) {
        if (creep.memory.upgrading && creep.store[RESOURCE_ENERGY] === 0) {
            creep.memory.upgrading = false;
            creep.say("🔄 harvest");
        }
        if (!creep.memory.upgrading && creep.store.getFreeCapacity() === 0) {
            creep.memory.upgrading = true;
            creep.say("⚡ upgrade");
        }

        if (creep.memory.upgrading) {
            const controller = creep.room.controller;

            if (controller) {
                if (creep.upgradeController(controller) === ERR_NOT_IN_RANGE) {
                    creep.moveTo(controller, { visualizePathStyle: { stroke: "#ffffff" } });
                }
            }
        } else {
            const source = findSource(creep);
            if (creep.harvest(source) === ERR_NOT_IN_RANGE) {
                creep.moveTo(source, { visualizePathStyle: { stroke: "#ffaa00" } });
            }
        }
    },
    spawnCap(room) {
        return 0;
    }
}