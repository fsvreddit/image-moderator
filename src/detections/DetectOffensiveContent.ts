import { SettingsFormField } from "@devvit/public-api";
import { DetectionBase } from "./DetectionBase.js";
import { SightengineResponse } from "../checkSightEngineAPI.js";

enum ModuleSetting {
    DetectNaziImagery = "OffensiveContent_DetectNaziImagery",
    DetectConfederateImagery = "OffensiveContent_DetectConfederateImagery",
    DetectSupremacistImagery = "OffensiveContent_DetectSupremacistImagery",
    DetectTerroristImagery = "OffensiveContent_DetectTerroristImagery",
    DetectionThreshold = "OffensiveContent_DetectionThreshold",
}

export class DetectOffensiveContent extends DetectionBase {
    public name = "OffensiveContent";
    public friendlyName = "Offensive Content Detection";
    public helpText = "Detects offensive content in images, such as Nazi, white supremacy or terrorist imagery.";
    public sightengineType = "offensive-2.0";

    public moduleSettings: SettingsFormField[] = [
        {
            type: "boolean",
            name: ModuleSetting.DetectNaziImagery,
            label: "Detect Nazi imagery",
            defaultValue: false,
            helpText: "Enable detection of Nazi imagery in images (e.g. Swastikas). If enabled, the app will flag posts that likely contain such imagery.",
        },
        {
            type: "boolean",
            name: ModuleSetting.DetectConfederateImagery,
            label: "Detect Confederate imagery",
            defaultValue: false,
            helpText: "Enable detection of Confederate imagery in images (e.g. Confederate flags). If enabled, the app will flag posts that likely contain such imagery.",
        },
        {
            type: "boolean",
            name: ModuleSetting.DetectSupremacistImagery,
            label: "Detect Supremacist imagery",
            defaultValue: false,
            helpText: "Enable detection of supremacist imagery in images (e.g. KKK, burning crosses, Celtic/Odin's cross, Valknut, Odal rune, Wolfsangel). If enabled, the app will flag posts that likely contain such imagery.",
        },
        {
            type: "boolean",
            name: ModuleSetting.DetectTerroristImagery,
            label: "Detect Terrorist imagery",
            defaultValue: false,
            helpText: "Enable detection of Terrorist imagery in images (e.g. ISIS/ISIL/Daesh flags)",
        },
        {
            type: "number",
            name: ModuleSetting.DetectionThreshold,
            label: "Threshold for detection",
            defaultValue: 80,
            helpText: "App will report the post if the likelihood is greater than this percentage.",
            onValidate: event => this.validatePercentage(event),
        },
    ];

    override defaultEnabledForMenu = false;

    private anyDetectionEnabled (): boolean {
        return this.getSetting<boolean>(ModuleSetting.DetectNaziImagery, false)
            || this.getSetting<boolean>(ModuleSetting.DetectConfederateImagery, false)
            || this.getSetting<boolean>(ModuleSetting.DetectSupremacistImagery, false)
            || this.getSetting<boolean>(ModuleSetting.DetectTerroristImagery, false);
    }

    public override enabledForProactive (): boolean {
        return super.enabledForProactive() && this.anyDetectionEnabled();
    }

    public override enabledForMenu (): boolean {
        return super.enabledForMenu() && this.anyDetectionEnabled();
    }

    private getDetectionResults (sightEngineResponse: SightengineResponse): string[] {
        const threshold = this.getSetting<number>(ModuleSetting.DetectionThreshold, 80);
        const results: string[] = [];

        if (this.getSetting<boolean>(ModuleSetting.DetectNaziImagery, false)) {
            const likelihood = sightEngineResponse.offensive?.nazi;
            if (likelihood && likelihood > threshold) {
                results.push(`Likely Nazi imagery: ${likelihood}%`);
            }
        }

        if (this.getSetting<boolean>(ModuleSetting.DetectConfederateImagery, false)) {
            const likelihood = sightEngineResponse.offensive?.confederate;
            if (likelihood && likelihood > threshold) {
                results.push(`Likely Confederate imagery: ${likelihood}%`);
            }
        }

        if (this.getSetting<boolean>(ModuleSetting.DetectSupremacistImagery, false)) {
            const likelihood = sightEngineResponse.offensive?.supremacist;
            if (likelihood && likelihood > threshold) {
                results.push(`Likely supremacist imagery: ${likelihood}%`);
            }
        }

        if (this.getSetting<boolean>(ModuleSetting.DetectTerroristImagery, false)) {
            const likelihood = sightEngineResponse.offensive?.terrorist;
            if (likelihood && likelihood > threshold) {
                results.push(`Likely terrorist imagery: ${likelihood}%`);
            }
        }

        return results;
    }

    public detectProactive (sightEngineResponse: SightengineResponse): string | undefined {
        const results = this.getDetectionResults(sightEngineResponse);
        if (results.length > 0) {
            return results.join(", ");
        }
    }

    public detectByMenu (sightEngineResponse: SightengineResponse): string | undefined {
        const results = this.getDetectionResults(sightEngineResponse);

        if (results.length > 0) {
            return results.join(", ");
        }
    }
}
