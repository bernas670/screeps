export interface Role {
    run(creep: Creep): void,
    spawnCap(room: Room): number
}

export enum RoleLabel {
    HARVESTER = "harvester",
    UPGRADER = "upgrader",
    BUILDER = "builder",
    REPAIRER = "repairer",
}