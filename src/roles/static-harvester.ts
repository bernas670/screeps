import _ from "lodash";
import { Role } from ".";

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

enum STATE {
    ROUTING,
    MOVING,
    COLLECTING,
};

const StaticHarvester: Role = {

    run(creep: Creep) {
        if (!creep.memory.state) {
            creep.memory.state = STATE.MOVING;
        }

        switch (creep.memory.state) {
            case STATE.ROUTING:
                const containers = findSource(creep).pos.findInRange(FIND_STRUCTURES, 1, {
                    filter: (structure) => structure instanceof StructureContainer
                });
                if (containers.length)
                    creep.memory.moveTo = containers[0].id;
                creep.memory.state = STATE.MOVING;
                break

            case STATE.MOVING:
                if (!creep.memory.moveTo) {
                    creep.memory.state = STATE.COLLECTING;
                    creep.memory.moveTo = undefined;
                    break;
                }

                const target = Game.getObjectById(creep.memory.moveTo) as Structure;
                if (creep.pos.isEqualTo(target.pos)) {
                    creep.memory.state = STATE.COLLECTING;
                    creep.memory.moveTo = undefined;
                } else {
                    creep.moveTo(target, { visualizePathStyle: { stroke: "#ffaa00" } });
                }
                break;

            case STATE.COLLECTING:
                const source = findSource(creep);
                if (creep.harvest(source) === ERR_NOT_IN_RANGE) {
                    creep.moveTo(source, { visualizePathStyle: { stroke: "#ffaa00" } });
                }
                break;
        }
    },

    spawnCap(room) {
        const sources = room.find(FIND_SOURCES);
        return sources.length;
    },

    body(room: Room) {
        return [
            WORK, WORK, WORK, WORK, WORK,
            MOVE, MOVE, MOVE, MOVE, MOVE,
        ];
    }
};

export default StaticHarvester;