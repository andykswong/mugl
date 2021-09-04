/**
 * This file was automatically generated by json-schema-to-typescript.
 * DO NOT MODIFY IT BY HAND. Instead, modify the source JSONSchema file,
 * and run json-schema-to-typescript to regenerate this file.
 */
export declare type KHRLightsPunctualGlTFExtension = KHRLightsPunctualGlTFExtension1 & KHRLightsPunctualGlTFExtension3;
export declare type KHRLightsPunctualGlTFExtension1 = GlTFProperty & KHRLightsPunctualGlTFExtension2;
/**
 * A directional, point, or spot light.
 */
export declare type Light = GlTFChildOfRootProperty & Light1;
export declare type GlTFChildOfRootProperty = GlTFProperty & GlTFChildOfRootProperty1;
export declare type LightSpot = GlTFProperty & LightSpot1;
export interface GlTFProperty {
    extensions?: Extension;
    extras?: Extras;
    [k: string]: unknown;
}
/**
 * Dictionary object with extension-specific objects.
 */
export interface Extension {
    [k: string]: {
        [k: string]: unknown;
    };
}
/**
 * Application-specific data.
 */
export interface Extras {
    [k: string]: unknown;
}
export interface KHRLightsPunctualGlTFExtension2 {
    lights: [Light, ...Light[]];
    extensions?: unknown;
    extras?: unknown;
    [k: string]: unknown;
}
export interface GlTFChildOfRootProperty1 {
    /**
     * The user-defined name of this object.
     */
    name?: string;
    [k: string]: unknown;
}
export interface Light1 {
    /**
     * Color of the light source.
     */
    color?: [number, number, number];
    /**
     * Intensity of the light source. `point` and `spot` lights use luminous intensity in candela (lm/sr) while `directional` lights use illuminance in lux (lm/m^2)
     */
    intensity?: number;
    spot?: LightSpot;
    /**
     * Specifies the light type.
     */
    type: ("directional" | "point" | "spot" | string) & string;
    /**
     * A distance cutoff at which the light's intensity may be considered to have reached zero.
     */
    range?: number;
    name?: unknown;
    extensions?: unknown;
    extras?: unknown;
    [k: string]: unknown;
}
export interface LightSpot1 {
    /**
     * Angle in radians from centre of spotlight where falloff begins.
     */
    innerConeAngle?: number;
    /**
     * Angle in radians from centre of spotlight where falloff ends.
     */
    outerConeAngle?: number;
    extensions?: unknown;
    extras?: unknown;
    [k: string]: unknown;
}
export interface KHRLightsPunctualGlTFExtension3 {
    [k: string]: unknown;
}
//# sourceMappingURL=KHR_lights_punctual.d.ts.map