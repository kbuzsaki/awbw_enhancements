class OptionsReader {
    constructor() {
    }

    static instance() {
        return _optionsReaderSingleton;
    }

    onOptionsReady(optionalCallback) {
        function loadOptionsWithCallback(callback) {
            chrome.storage.sync.get(kOptionDefaults, (result) => {
                console.log("Prepared options:", result);
                callback(result);
            });
        }

        if (optionalCallback) {
            loadOptionsWithCallback(optionalCallback);
            return;
        }

        return new Promise((resolve, reject) => {
            loadOptionsWithCallback(resolve);
        });
    }
}
let _optionsReaderSingleton = new OptionsReader();
