import roleBuilder from "./roles/builder";
import roleHarvester from "./roles/harvester";
import roleUpgrader from "./roles/upgrader";
import * as _ from "lodash";
import spawnCreeps from "./spawner";
import { RoleLabel } from "./roles";

export function loop() {

    for (const name in Memory.creeps) {
        if (!Game.creeps[name]) {
            delete Memory.creeps[name];
            console.log('Clearing non-existing creep memory:', name);
        }
    }

    for (const name in Game.rooms) {
        const room = Game.rooms[name];

        // Defense logic
        const enemies = room.find(FIND_HOSTILE_CREEPS);
        if (!enemies.length) break;

        Game.notify(`User ${enemies[0].owner.username} spotted in room ${name}`);

        const towers = room.find(FIND_MY_STRUCTURES, {
            filter: { structureType: STRUCTURE_TOWER }
        }) as StructureTower[];

        towers.forEach(tower => {
            const target = tower.pos.findClosestByRange(enemies);
            if (target) tower.attack(target);
        });
    }

    spawnCreeps();

    for (const name in Game.creeps) {
        const creep = Game.creeps[name];

        switch (creep.memory.role) {
            case RoleLabel.UPGRADER:
                roleUpgrader.run(creep);
                break;
            case RoleLabel.BUILDER:
                roleBuilder.run(creep);
                break;
            case RoleLabel.HARVESTER:
                roleHarvester.run(creep);
                break;
        }
    }
}