import { SettingsFormField } from "@devvit/public-api";
import { DetectionBase } from "./DetectionBase.js";
import { SightengineResponse } from "../checkSightEngineAPI.js";

enum ModuleSetting {
    DetectSpam = "QRCodes_DetectSpam",
    DetectSocialMedia = "QRCodes_DetectSocialMedia",
}

export class DetectQRCodeSpam extends DetectionBase {
    public name = "QRCodes";
    public friendlyName = "QR Code Spam Detection";
    public helpText = "Detects QR Codes that may link to spammy content or social media profiles. Useful for identifying posts that attempt to drive users to external sites via QR Codes.";
    public sightengineType = "qr-content";

    public moduleSettings: SettingsFormField[] = [
        {
            type: "boolean",
            name: ModuleSetting.DetectSpam,
            label: "Detect QR Code spam",
            defaultValue: false,
            helpText: "Enable detection of QR Code spam in images. If enabled, the app will flag posts that likely contain spammy QR Codes.",
        },
        {
            type: "boolean",
            name: ModuleSetting.DetectSocialMedia,
            label: "Detect social media QR Codes",
            defaultValue: false,
            helpText: "Enable detection of QR Codes that link to social media profiles. If enabled, the app will flag posts that likely contain such QR Codes.",
        },
    ];

    override defaultEnabledForMenu = false;

    private anyDetectionEnabled (): boolean {
        return this.getSetting<boolean>(ModuleSetting.DetectSpam, false)
            || this.getSetting<boolean>(ModuleSetting.DetectSocialMedia, false);
    }

    public override enabledForProactive (): boolean {
        return super.enabledForProactive() && this.anyDetectionEnabled();
    }

    public override enabledForMenu (): boolean {
        return super.enabledForMenu() && this.anyDetectionEnabled();
    }

    private getDetectionResults (sightEngineResponse: SightengineResponse): string[] {
        const results: string[] = [];
        if (this.getSetting<boolean>(ModuleSetting.DetectSpam, false) && sightEngineResponse.qr?.spam.length) {
            results.push("QR Code spam detected");
        }

        if (this.getSetting<boolean>(ModuleSetting.DetectSocialMedia, false) && sightEngineResponse.qr?.social.length) {
            results.push("QR Code linking to social media detected");
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
        } else {
            return "No QR Code spam or social media links detected.";
        }
    }
}
