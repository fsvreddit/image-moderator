import { SettingsFormField } from "@devvit/public-api";
import { SightengineResponse } from "../checkSightEngineAPI.js";
import { DetectionBase } from "./DetectionBase.js";

enum ModuleSetting {
    Threshold = "Deepfake_Threshold",
}

export class DetectDeepfake extends DetectionBase {
    public name = "Deepfake";
    public friendlyName = "Deepfake Detection";
    public sightengineType = "deepfake";

    override defaultEnabledForMenu = true;

    override moduleSettings: SettingsFormField[] = [
        {
            type: "number",
            label: "Threshold to report",
            name: ModuleSetting.Threshold,
            helpText: "App will report the post if the AI content likelihood is greater than this percentage.",
            defaultValue: 80,
            onValidate: ({ value }) => {
                if (!value) {
                    return;
                }
                if (value < 0 || value > 99) {
                    return "Value must be between 0 and 99.";
                }
            },
        },
    ];

    private getDeepfakeLikelihood (sightEngineResponse: SightengineResponse): number | undefined {
        if (!sightEngineResponse.type?.deepfake) {
            return;
        }

        return Math.round(sightEngineResponse.type.deepfake * 100);
    }

    public detectProactive (sightEngineResponse: SightengineResponse): string | undefined {
        const deepfakeLikelihood = this.getDeepfakeLikelihood(sightEngineResponse);
        if (!deepfakeLikelihood) {
            return;
        }

        if (deepfakeLikelihood > this.getSetting<number>(ModuleSetting.Threshold, 80)) {
            return `Deepfake Likelihood: ${deepfakeLikelihood}%.`;
        }
    }

    public detectByMenu (sightEngineResponse: SightengineResponse): string {
        const deepfakeLikelihood = this.getDeepfakeLikelihood(sightEngineResponse);
        if (!deepfakeLikelihood) {
            return "Error checking image.";
        }

        return `Deepfake Likelihood: ${deepfakeLikelihood}%.`;
    }
}
