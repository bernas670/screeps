import { RoleLabel } from "./roles";

declare global {
    interface CreepMemory {
        [name: string]: any;
        role: RoleLabel;

        upgrading?: boolean;
        building?: boolean;
        state?: number;

        source?: Id<_HasId>;
        target?: Id<_HasId>;
    }

    interface Memory {
        creeps: { [name: string]: CreepMemory };
    }
}

export {};
