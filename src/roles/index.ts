import Builder from "./builder";
import Harvester from "./harvester";
import Hauler from "./hauler";
import Repairer from "./repairer";
import StaticHarvester from "./static-harvester";
import Upgrader from "./upgrader";

export interface Role {
    run(creep: Creep): void,
    spawnCap(room: Room): number
    body(room: Room): BodyPartConstant[]
}

export enum RoleLabel {
    HARVESTER = "harvester",
    UPGRADER = "upgrader",
    BUILDER = "builder",
    REPAIRER = "repairer",
    STATIC_HARVESTER = "static-harvester",
    HAULER = "hauler",
}

const RoleMap: Record<RoleLabel, Role> = {
    [RoleLabel.HARVESTER]: Harvester,
    [RoleLabel.UPGRADER]: Upgrader,
    [RoleLabel.BUILDER]: Builder,
    [RoleLabel.REPAIRER]: Repairer,
    [RoleLabel.STATIC_HARVESTER]: StaticHarvester,
    [RoleLabel.HAULER]: Hauler,
};

export default RoleMap;