import { IChamferableBodyDefinition, IBodyDefinition } from 'matter-js';
/**
 * Matter.js constants.
 */


export enum BodyShape {
    circle = 1,
    rect = 2,
    polygon = 3,
    ray = 4
}

export enum HitCategory {
    None = 0,
    Wall = 1,
    Water = 2,
    Player = 4,
    Bullet = 8,

    /// ongoing damager.
    Damager = 16,

    Flag = 32,
    Spawn = 64,
    Mud = 128,

    /**
     * Intercepts projectiles, explosions.
     */
    Blocker = 256,

    /**
     * Anything that can interact with a player,
     * offensive or defensive.
     */
    Hittable = 512,

    Lava = 1024

}

export const SpawnBody: IChamferableBodyDefinition = {

    isSensor: true,
    isStatic: true,
    collisionFilter: {
        category: HitCategory.Spawn,
        mask: HitCategory.Player
    }
}

export const WallProperties: IChamferableBodyDefinition = {
    label: "wall",
    isStatic: true,
    isSensor: true,
    collisionFilter: {
        category: HitCategory.Wall,
        mask: HitCategory.Player | HitCategory.Bullet,
    }
};

export const WaterProps: IChamferableBodyDefinition = {
    label: "water",
    isStatic: true,
    isSensor: true,
    collisionFilter: {
        category: HitCategory.Water,
        mask: HitCategory.Player
    }
}

export const MudProps: IChamferableBodyDefinition = {
    label: "mud",
    isStatic: true,
    isSensor: true,
    collisionFilter: {
        category: HitCategory.Mud,
        mask: HitCategory.Player
    }
}

export const BulletBody: IBodyDefinition = {

    isSensor: true,
    friction: 0,
    frictionAir: 0,
    collisionFilter: {
        category: HitCategory.Bullet,
        mask: HitCategory.Wall | HitCategory.Player | HitCategory.Damager | HitCategory.Blocker | HitCategory.Hittable
    }
}


export const DamageBody: IBodyDefinition = {
    isSensor: true,
    friction: 0,
    frictionAir: 0,
    collisionFilter: {
        category: HitCategory.Damager,
        mask: HitCategory.Player | HitCategory.Bullet | HitCategory.Hittable | HitCategory.Blocker
    }
}