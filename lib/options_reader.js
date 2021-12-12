class OptionsReader {
    constructor() {
    }

    static instance() {
        return _optionsReaderSingleton;
    }

    onOptionsReady(callback) {
        chrome.runtime.sendMessage({type: "get_own_tab_id"}, (response) => {
            let ownTabId = response.tabId;

            // TODO: Somehow share options names and defaults with the options page?
            chrome.storage.sync.get({
                // Keyboard Shortcut Options
                options_enable_replay_shortcuts: true,
                options_bindings_rewind_turn:    [72 /*h*/, 38 /*up*/],
                options_bindings_rewind_action:  [75 /*k*/, 37 /*left*/],
                options_bindings_forward_turn:   [74 /*j*/, 39 /*right*/],
                options_bindings_forward_action: [76 /*l*/, 40 /*down*/],

                // Moveplanner Plus Options
                options_enable_moveplanner_plus: true,
                options_enable_move_range_preview: true,
                // TODO: make the service worker use OptionsReader as well?
                options_enable_savestate_interception: true,
                options_menu_opacity: 1.0,
                options_default_funding: 1000,
                options_bindings_toggle_calculator: [67 /*c*/],

                // Bugfix Options
                options_enable_bugfix_unwait_all: true,
                options_enable_bugfix_wait_mismatch: true,
                options_enable_bugfix_extra_capture_icons: true,
                options_enable_bugfix_encoded_sprite_urls: true,
                options_enable_bugfix_missing_units_players_id: true,
            }, (result) => {
                result.ownTabId = ownTabId;
                console.log("Prepared options:", result);
                callback(result);
            });
        });
    }
}
let _optionsReaderSingleton = new OptionsReader();
