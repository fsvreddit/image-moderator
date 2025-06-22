import { SettingsFormField, SettingsFormFieldGroup, SettingsValues } from "@devvit/public-api";
import { SightengineResponse } from "../checkSightEngineAPI.js";

export abstract class DetectionBase {
    public abstract name: string;
    public abstract friendlyName: string;
    public abstract sightengineType: string;

    abstract moduleSettings: SettingsFormField[];

    private defaultEnabledForProactive = false;
    abstract defaultEnabledForMenu: boolean;

    protected settings: SettingsValues;

    constructor (settings: SettingsValues) {
        this.settings = settings;
    }

    public getSettings (): SettingsFormFieldGroup {
        const settings: SettingsFormField[] = [
            {
                type: "boolean",
                name: `${this.name}_EnabledForProactive`,
                label: `Enable ${this.friendlyName} for proactive detection`,
                defaultValue: this.defaultEnabledForProactive,
            },
            {
                type: "boolean",
                name: `${this.name}_EnabledForMenu`,
                label: `Enable ${this.friendlyName} for detection from post menu`,
                defaultValue: this.defaultEnabledForMenu,
            },
        ];

        settings.push(...this.moduleSettings);

        return {
            type: "group",
            label: `Settings for ${this.friendlyName} detection`,
            fields: settings,
        };
    }

    public enabledForProactive (): boolean {
        return this.settings[`${this.name}_EnabledForProactive`] as boolean | undefined ?? this.defaultEnabledForProactive;
    }

    public enabledForMenu (): boolean {
        return this.settings[`${this.name}_EnabledForMenu`] as boolean | undefined ?? this.defaultEnabledForMenu;
    }

    protected getSetting<T> (name: string, defaultValue: T): T {
        return this.settings[name] as T | undefined ?? defaultValue;
    }

    public abstract detectProactive (sightEngineResponse: SightengineResponse): string | undefined;
    public abstract detectByMenu (sightEngineResponse: SightengineResponse): string;
}
