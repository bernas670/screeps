import * as _ from "lodash";
import RoleMap, { Role, RoleLabel } from "./roles";

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

        const spawnPriority: RoleLabel[] = [
            RoleLabel.STATIC_HARVESTER,
            RoleLabel.HAULER,
            // RoleLabel.HARVESTER,
            RoleLabel.REPAIRER,
            RoleLabel.UPGRADER,
            RoleLabel.BUILDER,
        ];

        for (const roleLabel of spawnPriority) {
            const creeps = _.filter(Game.creeps, (creep) => creep.memory.role === roleLabel);
            const role = RoleMap[roleLabel];

            if (creeps.length >= role.spawnCap(spawn.room)) continue;

            const newName = roleLabel + Game.time;
            console.log(`Spawning new ${roleLabel}: ${newName}`);
            spawn.spawnCreep(
                role.body(spawn.room),
                newName,
                { memory: { role: roleLabel } }
            );
            return;
        }
    });
}
