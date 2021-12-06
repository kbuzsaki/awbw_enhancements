class OptionsReader {
    constructor() {
    }

    onOptionsReady(callback) {
        chrome.runtime.sendMessage({type: "get_own_tab_id"}, (response) => {
            let ownTabId = response.tabId;

            chrome.storage.sync.get({
                options_enable_replay_shortcuts: true,
                options_enable_moveplanner_plus: true,
                options_enable_move_range_preview: true,
                // TODO: make the service worker use OptionsReader as well?
                options_enable_savestate_interception: true,
                options_menu_opacity: 1.0,
            }, (result) => {
                result.ownTabId = ownTabId;
                console.log("Prepared options:", result);
                callback(result);
            });
        });
    }
}
