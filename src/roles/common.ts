/**
 * Find the closest non-empty storage structure
 * @param {Creep} creep 
 * @returns Structure if found, null otherwise
 */
export function findStorage(creep: Creep): StructureStorage | StructureContainer | null {
    const containers = creep.room.find(FIND_STRUCTURES, {
        filter: (structure) => {
            return (
                structure instanceof StructureStorage ||
                structure instanceof StructureContainer
            ) && structure.store[RESOURCE_ENERGY] > 0;
        }
    }) as (StructureStorage | StructureContainer)[];

    // if (!containers.length) return null;
    return creep.pos.findClosestByPath(containers);
}