class OptionsReader {
    constructor() {
    }

    onOptionsReady(callback) {
        chrome.storage.sync.get({
            options_enable_replay_shortcuts: true,
            options_enable_moveplanner_plus: true,
            options_enable_move_range_preview: true,
            // TODO: make the service worker use OptionsReader as well?
            options_enable_savestate_interception: true,
        }, (result) => {
            console.log("Got result from storage.sync:", result);
            callback(result);
        });
    }
}
