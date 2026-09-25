export const RESOURCE_TYPES = ["article", "exercise", "guide"] as const;
export type ResourceType = (typeof RESOURCE_TYPES)[number];
