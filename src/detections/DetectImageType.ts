import { SettingsFormField } from "@devvit/public-api";
import { DetectionBase } from "./DetectionBase.js";
import { SightengineResponse } from "../checkSightEngineAPI.js";

enum ModuleSetting {
    ImageTypeToDetect = "ImageType_ImageTypeToDetect",
}

export class DetectImageType extends DetectionBase {
    public name = "ImageType";
    public friendlyName = "Image Type Detection";
    public helpText = "Detects photographs vs. illustrations. Useful for subs that prefer one type over another.";
    public sightengineType = "type";

    public moduleSettings: SettingsFormField[] = [
        {
            type: "select",
            name: ModuleSetting.ImageTypeToDetect,
            label: "Image Type to Detect",
            options: [
                { value: "photo", label: "Photo" },
                { value: "illustration", label: "Illustration" },
            ],
            defaultValue: ["photo"],
            helpText: "The type of image to detect. The app will flag posts that contain this type of image.",
            multiSelect: false,
            onValidate: ({ value }) => {
                if (!value || value.length === 0) {
                    return "You must select an image type to detect.";
                }
            },
        },
    ];

    override defaultEnabledForMenu = false;

    override enabledForProactive (): boolean {
        return super.enabledForProactive() && this.getReportableImageType() !== undefined;
    }

    override enabledForMenu (): boolean {
        return super.enabledForMenu() && this.getReportableImageType() !== undefined;
    }

    private getImageType (sightEngineResponse: SightengineResponse): "photo" | "illustration" | undefined {
        const threshold = 0.7;
        const isPhoto = sightEngineResponse.type?.photo !== undefined && sightEngineResponse.type.photo > threshold;
        const isIllustration = sightEngineResponse.type?.illustration !== undefined && sightEngineResponse.type.illustration > threshold;

        if (isPhoto && isIllustration) {
            return undefined; // Both types detected, ambiguous
        } else if (isPhoto) {
            return "photo";
        } else if (isIllustration) {
            return "illustration";
        }
    }

    private getReportableImageType (): "photo" | "illustration" | undefined {
        const selectedType = this.getSetting<string[]>(ModuleSetting.ImageTypeToDetect, []);
        if (selectedType.length === 0) {
            return undefined;
        }
        return selectedType[0] as "photo" | "illustration";
    }

    public detectProactive (sightEngineResponse: SightengineResponse): string | undefined {
        const detectedType = this.getImageType(sightEngineResponse);
        const reportableType = this.getReportableImageType();

        if (detectedType && detectedType !== reportableType) {
            return `Detected image type: ${detectedType}`;
        }
    }

    public detectByMenu (sightEngineResponse: SightengineResponse): string | undefined {
        const detectedType = this.getImageType(sightEngineResponse);

        return `Detected image type: ${detectedType ?? "uncertain"}`;
    }
}
