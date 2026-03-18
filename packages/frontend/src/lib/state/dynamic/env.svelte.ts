import { getEnvSettings, type EnvSettings } from "$lib/interface/rest/env.service";

class Env {
	private _settings: EnvSettings | undefined = $state();

	constructor() {}

	public get settings(): EnvSettings | undefined {
		return this._settings;
	}

	public set settings(v: EnvSettings | undefined) {
		this._settings = v;
	}

	async init() {
		try {
			this._settings = await getEnvSettings();
			if (!this.settings?.OPENPLEB_MINT_URL) {
				throw new Error("could not get mint env");
			}
		} catch (error) {
			console.error('Failed to fetch environment settings:', error);
			// Don't throw - allow app to continue even if env fetch fails
		}
	}
}

export const env = new Env();
