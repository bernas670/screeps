import { findStorage } from "./common";
import { Role } from ".";

const Upgrader: Role = {
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
            const source = findStorage(creep);
            if (!source) return;
            if (creep.withdraw(source, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
                creep.moveTo(source, { visualizePathStyle: { stroke: "#ffaa00" } });
            }
        }
    },

    spawnCap(room) {
        return 1;
    },

    body(room: Room) {
        return [
            CARRY, // 50, only need one because storage is next to controller
            WORK, WORK, WORK, WORK, WORK, WORK, // 600, 10 per tick
            MOVE, MOVE, MOVE
        ]
    }
}

export default Upgrader;