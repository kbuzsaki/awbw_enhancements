const kAw1PortraitsPrefix = "terrain/ani/";
const kAw2PortraitsPrefix = "terrain/ani/aw2";
const kDsPortraitsPrefix = "terrain/ani/ds";

const kFallbackPortraitPrefix = kDsPortraitsPrefix;

class ProfileSettingsReader {
    constructor() {
        this.cachedProfileSettings = undefined;
        this.fetchedProfileSettings = undefined;
        this.listeners = [];

        this.initialStorageReadPromise = this.readProfileSettingsFromStorage();
        this.startAsyncProfileSettingsFetch();
    }

    static async instance() {
        let reader = _profileSettingsReaderSingleton;
        await reader.waitForReady();
        return reader;
    }

    async waitForReady() {
        if (this.cachedProfileSettings === undefined) {
            this.cachedProfileSettings = await this.initialStorageReadPromise;
        }
        return "";
    }

    addProfileSettingsUpdateListener(listener) {
        this.listeners.push(listener);
    }

    getCoPortraitsPrefix() {
        if (this.fetchedProfileSettings !== undefined) {
            return this.fetchedProfileSettings.settings_co_portraits_prefix;
        } else if (this.cachedProfileSettings !== undefined) {
            return this.cachedProfileSettings.cached_profile_settings_co_portraits_prefix;
        } else {
            reportError("Resorted to fallback co portraits prefix");
            return kFallbackPortraitsPrefix;
        }
    }

    readProfileSettingsFromStorage() {
        return new Promise((resolve, reject) => {
            chrome.storage.sync.get({
                cached_profile_settings_co_portraits_prefix: kFallbackPortraitPrefix,
            }, (cachedProfileSettings) => {
                console.log("Read cached settings from storage:", cachedProfileSettings);
                resolve(cachedProfileSettings);
            });
        });
    }

    startAsyncProfileSettingsFetch() {
        fetchProfileSettings().then((settings) => {
            this.handleAsyncProfileSettingsFetch(settings);
        });
    }

    handleAsyncProfileSettingsFetch(parsedSettings) {
        this.fetchedProfileSettings = parsedSettings;
        chrome.storage.sync.set({
            cached_profile_settings_co_portraits_prefix: parsedSettings.settings_co_portraits_prefix,
        });

        for (let listener of this.listeners) {
            listener();
        }
    }
}
let _profileSettingsReaderSingleton = new ProfileSettingsReader();
