let kCheckOptionsMapping = [
    {
        id: "enable-replay-shortcuts",
        name: "options_enable_replay_shortcuts",
        default: true,
        label: "Enable Replay Keyboard Shortcuts",
        description: [
            "Use the keyboard to navigate forward and backward in replays rather than having " +
            "to click the buttons."
        ],
    }, {
        id: "enable-moveplanner-plus",
        name: "options_enable_moveplanner_plus",
        default: true,
        label: "Enable Moveplanner Plus",
        description: [
            `Moveplanner Plus adds "player panels" with unit count, unit value, income, and funds to ` +
            `the moveplanner. It can also track funds over time by deducting funds when units are built ` +
            `and adding funds income when you advance the turn.`,
            `Moveplanner Plus currently does not track power bar charge, handle repairs, or correctly ` +
            `account for units loaded in transports.`,
            `Enabling Moveplanner Plus is required for all other features in this category, with the ` +
            `exception of certain bug fixes.`
        ],
    }, {
        id: "enable-move-range-preview",
        name: "options_enable_move_range_preview",
        requires: ["js-requires-moveplanner-plus"],
        default: true,
        label: "Enable Move Range Preview",
        description: [
            `Adds a movement range preview when selecting units in the moveplanner.`,
            `Note that this preview does not take into account fuel consumption.`
        ],
    }, {
        id: "enable-savestate-interception",
        name: "options_enable_savestate_interception",
        requires: ["js-requires-moveplanner-plus"],
        default: true,
        label: "Enable Enhanced Savestates",
        description: [
            `This option enables the in-page "snapshot and restore" feature that lets you make quick ` +
            `savestates without downloading a savestate file. It also adds AWBW Helper's extra data ` +
            `like current funds to savestates that you download.`,
            `Disabling this feature will stop AWBW Helper from tampering with savestate downloads. ` +
            `This is an escape hatch in case future AWBW updates temporarily break the snapshot feature.`,
        ],
    }, {
        id: "enable-bugfix-wait-mismatch",
        name: "options_enable_bugfix_wait_mismatch",
        default: true,
        label: 'Fix Waited Units Showing as Unwaited',
        description: [
            `Fixes the bug where the most recently moved unit in a game sometimes shows as unwaited.`
        ],
    }, {
        id: "enable-bugfix-unwait-all",
        name: "options_enable_bugfix_unwait_all",
        default: true,
        label: 'Fix "Unwait All" for Moved Units',
        description: [
            `Fixes the "Unwait All" button not unwaiting units that were already moved that turn, before ` +
            `the moveplanner was opened.`
        ],
    }, {
        id: "enable-bugfix-missing-units-players-id",
        name: "options_enable_bugfix_missing_units_players_id",
        default: true,
        label: 'Fix Damage Calculator Selection',
        description: [
            `Fixes the bug where units built in the moveplanner cannot be selected with the damage calculator.`
        ],
    }, {
        id: "enable-bugfix-extra-capture-icons",
        name: "options_enable_bugfix_extra_capture_icons",
        default: true,
        label: 'Fix Extra "Capture" Icons',
        description: [
            `Fixes extra "capture" icons being displayed for infantry that already finished capturing.`
        ],
    }, {
        id: "enable-bugfix-encoded-sprite-urls",
        name: "options_enable_bugfix_encoded_sprite_urls",
        default: true,
        label: 'Fix Broken Black Boat Sprites',
        description: [
            `Fixes Black Boat sprites displaying incorrectly after savestate reload.`,
        ],
    }, {
        id: "enable-bugfix-broken-sonja-hp",
        name: "options_enable_bugfix_broken_sonja_hp",
        default: true,
        label: 'Fix Broken Sonja HP',
        description: [
            `Fixes Sonja '?' HP displaying incorrectly after savestate reload.`,
        ],
    }, {
        id: "enable-bugfix-revealed-neutral-fog-buildings",
        name: "options_enable_bugfix_revealed_neutral_fog_buildings",
        default: true,
        label: 'Fix Properties Incorrectly Displaying as Revealed',
        description: [
            `Fixes properties that are hidden in fog being displayed as "revealed" properties after ` +
            `savestate load rather than "hidden" properties.`,
        ],
    },
];

let kRangeOptionsMapping = [
    {
        id: "default-funding-range",
        previewId: "default-funding-preview",
        name: "options_default_funding",
        default: 1000,
        min: 0,
        max: 9500,
        step: 500,
        label: "Default Funding",
        description: [
            `The default funding level when opening the moveplanner from a map preview rather than an ` +
            `ongoing game.`
        ],
    }, {
        id: "menu-opacity-range",
        previewId: "menu-opacity-preview",
        requires: ["js-requires-moveplanner-plus"],
        name: "options_menu_opacity",
        default: 0.75,
        min: 0.15,
        max: 1,
        step: 0.05,
        label: "Menu Opacity",
        description: [
            `Makes the "Action Menu" and "Build Menu" partially transparent so that you can see behind them.`
        ],
    }
];

let kKeyboardOptionsMapping = [
    {
        id: "rewind-turn",
        name: "options_bindings_rewind_turn",
        default: [38 /*up*/,    72 /*h*/],
        label: "Rewind Turn",
        description: [],
    }, {
        id: "rewind-action",
        name: "options_bindings_rewind_action",
        default: [37 /*left*/,  75 /*k*/],
        label: "Rewind Action",
        description: [],
    }, {
        id: "forward-action",
        name: "options_bindings_forward_action",
        default: [39 /*right*/, 74 /*j*/],
        label: "Forward Action",
        description: [],
    }, {
        id: "forward-turn",
        name: "options_bindings_forward_turn",
        default: [40 /*down*/, 76 /*l*/],
        label: "Forward Turn",
        description: [],
    }, {
        id: "toggle-calculator",
        name: "options_bindings_toggle_calculator",
        default: [67 /*c*/],
        label: "Toggle Calculator",
        description: [
            `Keyboard shortcut for toggling the Damage Calculator. Also works on the game page.`,
        ],
    },
];

let kAllOptionsMapping = kCheckOptionsMapping.concat(kRangeOptionsMapping).concat(kKeyboardOptionsMapping);

let kOptionDefaults = Object.fromEntries(kAllOptionsMapping.map(
    (optionMapping) => [optionMapping.name, optionMapping.default]));
