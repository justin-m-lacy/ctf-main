import { BodyType, ShotType } from "../../../server/src/model/schema/types"

export type ObjectName = keyof typeof ShotType | keyof typeof BodyType;

/**
 * Custom visual data to apply to an effect based on craft/character/etc
 * Stored in visuals.json
 */
export type VisualData = {

    /**
     * Rate of rotation, in degrees
     */
    spin?: number,

    /**
     * 
     */
    width?: number,

    height?: number,

    scale?: number,

    radius?: number
}