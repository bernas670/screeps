let roleRepairer: {
    run(creep: Creep): void
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

export default roleRepairer = {
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
            const source = findSource(creep);
            if (creep.harvest(source) === ERR_NOT_IN_RANGE) {
                creep.moveTo(source, { visualizePathStyle: { stroke: "#ffaa00" } });
            }
        }
    },
    spawnCap(room) {
        const sites = room.find(FIND_CONSTRUCTION_SITES);
        const progressLeft = sites.reduce((total, site) => total + (site.progressTotal - site.progress), 0);
        const builders = Math.ceil(progressLeft / 1500);
        return builders;
    }
}