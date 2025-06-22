import { SettingsValues } from "@devvit/public-api";
import { DetectionBase } from "./DetectionBase.js";
import { DetectGenAI } from "./DetectGenAI.js";
import { DetectDeepfake } from "./DetectDeepfake.js";
import { DetectImageQuality } from "./DetectImageQuality.js";

export const ALL_DETECTIONS: (new (settings: SettingsValues) => DetectionBase)[] = [
    DetectGenAI,
    DetectDeepfake,
    DetectImageQuality,
];

export function getRelevantModels (settings: SettingsValues, mode: "proactive" | "menu"): string[] {
    const models = new Set<string>();
    for (const Detection of ALL_DETECTIONS) {
        const detectionInstance = new Detection(settings);
        if (mode === "proactive" && detectionInstance.enabledForProactive()) {
            models.add(detectionInstance.sightengineType);
        } else if (mode === "menu" && detectionInstance.enabledForMenu()) {
            models.add(detectionInstance.sightengineType);
        }
    }

    return Array.from(models);
}
