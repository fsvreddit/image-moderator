import { SettingsFormField } from "@devvit/public-api";
import { DetectionBase } from "./DetectionBase.js";
import { SightengineResponse } from "../checkSightEngineAPI.js";

enum ModuleSetting {
    QualityThreshold = "ImageQuality_QualityThreshold",
}

export class DetectImageQuality extends DetectionBase {
    public name = "ImageQuality";
    public friendlyName = "Image Quality Detection";
    public helpText = "Detects low quality or blurry images. Useful for identifying posts with poor image quality.";
    public sightengineType = "quality";

    public moduleSettings: SettingsFormField[] = [
        {
            type: "number",
            name: ModuleSetting.QualityThreshold,
            label: "Quality Threshold",
            defaultValue: 50,
            helpText: "Threshold for image quality detection (0 to 100). Less than 50% is likely to be a low quality, blurry image.",
            onValidate: event => this.validatePercentage(event),
        },
    ];

    override defaultEnabledForMenu = false;

    private getQualityScore (sightEngineResponse: SightengineResponse): number | undefined {
        if (sightEngineResponse.quality?.score === undefined) {
            return;
        };

        return Math.round(sightEngineResponse.quality.score * 100);
    }

    public detectProactive (sightEngineResponse: SightengineResponse): string | undefined {
        const quality = this.getQualityScore(sightEngineResponse);
        if (quality && quality < this.getSetting(ModuleSetting.QualityThreshold, 50)) {
            return `Image quality is low (${quality})`;
        }
        return undefined;
    }

    public detectByMenu (sightEngineResponse: SightengineResponse): string | undefined {
        const quality = this.getQualityScore(sightEngineResponse);
        if (quality && quality < this.getSetting(ModuleSetting.QualityThreshold, 50)) {
            return `Image quality is low (${quality})`;
        }
        return "Image quality is acceptable";
    }
}
