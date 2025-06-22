import { SettingsValues } from "@devvit/public-api";
import { DetectionBase } from "./DetectionBase.js";
import { DetectGenAI } from "./DetectGenAI.js";
import { DetectDeepfake } from "./DetectDeepfake.js";
import { DetectImageQuality } from "./DetectImageQuality.js";
import { DetectMinors } from "./DetectMinors.js";
import { DetectOffensiveContent } from "./DetectOffensiveContent.js";
import { DetectQRCodeSpam } from "./DetectQRCodes.js";
import { DetectTextSpam } from "./DetectTextSpam.js";
import { DetectDrugs } from "./DetectDrugs.js";

export const ALL_DETECTIONS: (new (settings: SettingsValues) => DetectionBase)[] = [
    DetectGenAI,
    DetectDeepfake,
    DetectImageQuality,
    DetectMinors,
    DetectOffensiveContent,
    DetectQRCodeSpam,
    DetectTextSpam,
    DetectDrugs,
];

export function getModels (detectors: (new (settings: SettingsValues) => DetectionBase)[]): string[] {
    const models = new Set<string>();
    for (const Detection of detectors) {
        const detectionInstance = new Detection({});
        models.add(detectionInstance.sightengineType);
    }

    return Array.from(models);
}

export function getRelevantDetectors (settings: SettingsValues, mode: "proactive" | "menu"): (new (settings: SettingsValues) => DetectionBase)[] {
    const detectors: (new (settings: SettingsValues) => DetectionBase)[] = [];
    for (const Detection of ALL_DETECTIONS) {
        const detectionInstance = new Detection(settings);
        if (mode === "proactive" && detectionInstance.enabledForProactive()) {
            detectors.push(Detection);
        } else if (mode === "menu" && detectionInstance.enabledForMenu()) {
            detectors.push(Detection);
        }
    }

    return detectors;
}
