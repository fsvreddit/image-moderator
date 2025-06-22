import { SettingsFormField } from "@devvit/public-api";
import { DetectionBase } from "./DetectionBase.js";
import { SightengineResponse } from "../checkSightEngineAPI.js";

enum ModuleSetting {
    QualityThreshold = "ImageQuality_QualityThreshold",
}

export class DetectImageQuality extends DetectionBase {
    public name = "ImageQuality";
    public friendlyName = "Image Quality Detection";
    public sightengineType = "quality";

    public moduleSettings: SettingsFormField[] = [
        {
            type: "number",
            name: ModuleSetting.QualityThreshold,
            label: "Quality Threshold",
            defaultValue: 0.5,
            helpText: "Threshold for image quality detection (0 to 1). Less than 0.5 is likely to be a low quality, blurry image.",
        },
    ];

    override defaultEnabledForMenu = false;

    public detectProactive (sightEngineResponse: SightengineResponse): string | undefined {
        const quality = sightEngineResponse.quality?.score;
        if (quality && quality < this.getSetting("quality_threshold", 0.5)) {
            return `Image quality is low (${quality}).`;
        }
        return undefined;
    }

    public detectByMenu (sightEngineResponse: SightengineResponse): string {
        const quality = sightEngineResponse.quality?.score;
        if (quality && quality < this.getSetting("quality_threshold", 0.5)) {
            return `Image quality is low (${quality}).`;
        }
        return "Image quality is acceptable.";
    }
}
