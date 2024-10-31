import * as _ from "lodash";
import roleHarvester from "./roles/harvester";
import roleUpgrader from "./roles/upgrader";
import roleBuilder from "./roles/builder";
import { RoleLabel } from "./roles";

export default function spawnCreeps() {

    const body = [
        WORK, WORK, WORK, WORK, // 400
        CARRY, CARRY, CARRY, // 150
        MOVE, MOVE, MOVE, MOVE, MOVE // 150
    ]

    _.forEach(Game.spawns, (spawn) => {

        if (spawn.spawning) {
            const spawningCreep = Game.creeps[spawn.spawning.name];
            spawn.room.visual.text(
                '🛠️' + spawningCreep.memory.role,
                spawn.pos.x + 1,
                spawn.pos.y,
                { align: 'left', opacity: 0.8 }
            );
            return;
        }
 
        const harvesters = _.filter(Game.creeps, (creep) => creep.memory.role === RoleLabel.HARVESTER);
        if (harvesters.length < roleHarvester.spawnCap(spawn.room)) {
            const newName = 'Harvester' + Game.time;
            console.log('Spawning new harvester: ' + newName);
            spawn.spawnCreep(
                body,
                newName,
                { memory: { role: RoleLabel.HARVESTER } }
            );
        }

        const builders = _.filter(Game.creeps, (creep) => creep.memory.role === RoleLabel.BUILDER);
        if (builders.length < roleBuilder.spawnCap(spawn.room)) {
            const newName = 'Builder' + Game.time;
            console.log('Spawning new builder: ' + newName);
            spawn.spawnCreep(
                body,
                newName,
                { memory: { role: RoleLabel.BUILDER } }
            );
        }

        const upgraders = _.filter(Game.creeps, (creep) => creep.memory.role === RoleLabel.UPGRADER);
        if (upgraders.length < roleUpgrader.spawnCap(spawn.room)) {
            const newName = 'Upgrader' + Game.time;
            console.log('Spawning new upgrader: ' + newName);
            spawn.spawnCreep(
                body,
                newName,
                { memory: { role: RoleLabel.UPGRADER } }
            );
        }
    });
}
