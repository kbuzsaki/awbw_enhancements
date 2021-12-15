const kNameOverrides = {
    8:   "Backspace",
    9:   "Tab",
    13:  "Enter",
    16:  "Shift",
    17:  "Ctrl",
    18:  "Alt",
    19:  "Pause/Break",
    20:  "Caps Lock",
    27:  "Esc",
    32:  "Spacebar",
    33:  "Page Up",
    34:  "Page Down",
    35:  "End",
    36:  "Home",
    37:  "Left Arrow",
    38:  "Up Arrow",
    39:  "Right Arrow",
    40:  "Down Arrow",
    45:  "Insert",
    46:  "Delete",
    91:  "Left Meta",
    92:  "Right Meta[1]",
    93:  "Right Meta[2]",
    96:  "Num 0",
    97:  "Num 1",
    98:  "Num 2",
    99:  "Num 3",
    100: "Num 4",
    101: "Num 5",
    102: "Num 6",
    103: "Num 7",
    104: "Num 8",
    105: "Num 9",
    106: "*",
    107: "+",
    109: "-",
    110: ".",
    112: "F1",
    113: "F2",
    114: "F3",
    115: "F4",
    116: "F5",
    117: "F6",
    118: "F7",
    119: "F8",
    120: "F9",
    121: "F10",
    122: "F11",
    123: "F12",
    144: "Num Lock",
    145: "Scroll Lock",
    186: ";",
    187: "=",
    188: ",",
    189: "-",
    190: ".",
    191: "/",
    192: "`",
    219: "[",
    220: "\\",
    221: "]",
    222: "'",
};
function keyCodeToName(keyCode) {
    keyCode = keyCode+0;
    let override = kNameOverrides[keyCode];
    if (override !== undefined) { return override; }
    let other = String.fromCharCode(keyCode);
    return other;
}

class KeybindListener {
    constructor(modalId) {
        this.keybindOptions = [];
        this.currentOption = undefined;
        this.modalElement = document.getElementById(modalId);
        this.modal = bootstrap.Modal.getOrCreateInstance(this.modalElement);

        this.modalElement.addEventListener("hidden.bs.modal", (event) => {
            this.cancelListen();
        });
        document.getElementById("clear-binding-btn").addEventListener("click", (event) => {
            this.handleClear();
        });

        document.addEventListener("keydown", (event) => {
            if (this.isActive()) {
                this.handleEvent(event);
                event.preventDefault();
                event.stopPropagation();
            }
        });
    }

    addKeybindOption(keybindOption) {
        this.keybindOptions.push(keybindOption);
    }

    isActive() { return this.currentOption !== undefined; }

    handleEvent(event) {
        console.log("Got keyCode:", event.keyCode,
            "(" + keyCodeToName(event.keyCode) + ") for option:", this.currentOption.optionId);

        let currentOption = this.currentOption;
        this.cancelListen();
        currentOption.setKeyCode(event.keyCode);
        for (let keybindOption of this.keybindOptions) {
            if (keybindOption !== currentOption && keybindOption.keyCode() === event.keyCode) {
                keybindOption.clearKeyCode();
            }
        }
    }

    handleClear() {
        let currentOption = this.currentOption;
        this.cancelListen();
        currentOption.clearKeyCode();
    }

    listen(option) {
        this.cancelListen();
        this.currentOption = option;

        let name = this.currentOption.name;
        let currentKey = this.currentOption.input.value || "None";
        let spans = this.modalElement.querySelectorAll(".modal-body span");
        spans[0].innerHTML = name;
        spans[1].innerHTML = currentKey;

        this.modal.show();
    }

    cancelListen() {
        if (this.modalElement.classList.contains("show")) {
            this.modal.hide();
        }
        this.currentOption = undefined;
    }
}

class KeybindOption {
    constructor(optionId, name, keybindListener){
        this.optionId = optionId;
        this.name = name;
        this.keybindListener = keybindListener;

        this.input = document.getElementById(this.optionId);
        this.input.addEventListener("click", (event) => { this.onClick(event); });
    }

    keyCode() {
        if (this.input.hasAttribute("rawkeycode")) {
            return parseInt(this.input.getAttribute("rawkeycode"));
        }
        return undefined;
    }

    onClick(event) {
        console.log("clicked:", this.optionId);

        if (this.keybindListener.currentOption === this) {
            this.keybindListener.cancelListen();
        } else {
            this.startListen();
        }
    }

    startListen() {
        this.keybindListener.listen(this);
    }

    setKeyCode(keyCode) {
        this.input.value = keyCodeToName(keyCode);
        this.input.setAttribute("rawkeycode", keyCode);
        this.input.dispatchEvent(new Event("change"));
    }

    clearKeyCode() {
        this.input.value = "";
        this.input.removeAttribute("rawkeycode");
        this.input.dispatchEvent(new Event("change"));
    }
}


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


function templateDescription(lines) {
    let description = "";
    for (let i = 0; i < lines.length; i++) {
        let padding = (i === (lines.length - 1)) ? 'mb-0' : 'mb-2';
        description += `<p class="${padding}">${lines[i]}</p>`;
    }
    return description;
}

function templateCheckboxOption(mapping) {
    let description = templateDescription(mapping.description);
    let requires = (mapping.requires || []).join(" ");

    return `
<div class="row mb-3">
  <div class="col">
    <div class="form-check">
      <input type="checkbox" class="form-check-input ${requires}" id="${mapping.id}">
      <label for="${mapping.id}" class="form-check-label">${mapping.label}</label>
    </div>
  </div>
  <div class="form-text">${description}</div>
</div>`;
}

function initializeCheckboxOptions() {
    for (let optionMapping of kCheckOptionsMapping) {
        let container = document.getElementById(optionMapping.id + "-container");
        container.innerHTML = templateCheckboxOption(optionMapping);
    }
}

function templateRangeOption(mapping) {
    let description = templateDescription(mapping.description);
    let requires = (mapping.requires || []).join(" ");

    return `
<div class="row mb-3">
  <div class="col-sm-4 col-lg-3">
    <label for="${mapping.id}" class="form-label">${mapping.label}</label>
  </div>
  <div class="col-sm-2 col-xl-1">
      <input type="text" readonly class="form-control" id="${mapping.previewId}" value="${mapping.default}">
  </div>
  <div class="col">
    <input type="range" id="${mapping.id}" class="form-range ${requires}"
           min="${mapping.min}" max="${mapping.max}" step="${mapping.step}">
  </div>
  <div class="form-text">${description}</div>
</div>
    `;
}

function initializeRangeOptions() {
    for (let optionMapping of kRangeOptionsMapping) {
        let container = document.getElementById(optionMapping.id + "-container");
        container.innerHTML = templateRangeOption(optionMapping);

        let inputElement = document.getElementById(optionMapping.id);
        let previewElement = document.getElementById(optionMapping.previewId);
        if (inputElement && previewElement) {
            inputElement.addEventListener("input", () => {
                previewElement.value = inputElement.value;
            });
        }
        previewElement.value = inputElement.value;
    }
}

const kMaxKeyboardBindings = 4;
function templateKeyboardOption(mapping) {
    let description = templateDescription(mapping.description);
    let bindingHtml = "";
    for (let i = 1; i <= kMaxKeyboardBindings; i++) {
        bindingHtml += `
<div class="col">
  <input type="text" readonly class="form-control" id="${mapping.id}-${i}">
</div>`;
    }

    return `
<div class="row mb-3">
  <label class="col-sm-3 col-lg-2 col-form-label">${mapping.label}</label>
  ${bindingHtml}
  <div class="form-text">${description}</div>
</div>`;
}

function initializeKeyboardOptions() {
    let keybindListener = new KeybindListener("keybinding-modal");
    for (let optionMapping of kKeyboardOptionsMapping) {
        let container = document.getElementById(optionMapping.id + "-container");
        container.innerHTML = templateKeyboardOption(optionMapping);

        for (let i = 1; i <= kMaxKeyboardBindings; i++) {
            let inputId = optionMapping.id + "-" + i;
            keybindListener.addKeybindOption(new KeybindOption(inputId, optionMapping.label, keybindListener));
        }
    }
}

function setOptionsOnPage(options) {
    for (let optionMapping of kCheckOptionsMapping) {
        if (options.hasOwnProperty(optionMapping.name)) {
            let inputElement = document.getElementById(optionMapping.id);
            if (inputElement) {
                inputElement.checked = options[optionMapping.name];
            }
        }
    }

    for (let optionMapping of kRangeOptionsMapping) {
        if (options.hasOwnProperty(optionMapping.name)) {
            let inputElement = document.getElementById(optionMapping.id);
            if (inputElement) {
                inputElement.value = options[optionMapping.name];
            }
            let previewElement = document.getElementById(optionMapping.previewId);
            if (previewElement) {
                previewElement.value = options[optionMapping.name];
            }
        }
    }

    for (let optionMapping of kKeyboardOptionsMapping) {
        if (options.hasOwnProperty(optionMapping.name)) {
            let bindings = options[optionMapping.name];
            for (let i = 0; i < kMaxKeyboardBindings; i++) {
                let inputElement = document.getElementById(optionMapping.id + "-" + (i + 1));
                if (inputElement) {
                    if (i < bindings.length) {
                        inputElement.value = keyCodeToName(bindings[i]);
                        inputElement.setAttribute("rawkeycode", bindings[i]);
                    } else {
                        inputElement.value = "";
                        inputElement.removeAttribute("rawkeycode");
                    }
                }
            }
        }
    }
}

function parseOptionsFromPage() {
    let parsedOptions = {};

    for (let optionMapping of kCheckOptionsMapping) {
        let inputElement = document.getElementById(optionMapping.id);
        if (inputElement) {
            parsedOptions[optionMapping.name] = inputElement.checked;
        }
    }

    for (let optionMapping of kRangeOptionsMapping) {
        let inputElement = document.getElementById(optionMapping.id);
        if (inputElement) {
            parsedOptions[optionMapping.name] = parseFloat(inputElement.value);
        }
    }

    for (let optionMapping of kKeyboardOptionsMapping) {
        let bindings = [];
        for (let i = 0; i < kMaxKeyboardBindings; i++) {
            let inputElement = document.getElementById(optionMapping.id + "-" + (i + 1));
            if (inputElement) {
                if (inputElement.hasAttribute("rawkeycode")) {
                    bindings.push(parseInt(inputElement.getAttribute("rawkeycode")));
                }
            }
        }
        parsedOptions[optionMapping.name] = bindings;
    }

    return parsedOptions;
}

initializeCheckboxOptions();
initializeRangeOptions();
initializeKeyboardOptions();

let kOptionDefaults = Object.fromEntries(kAllOptionsMapping.map(
    (optionMapping) => [optionMapping.name, optionMapping.default]));

chrome.storage.sync.get(kOptionDefaults, (result) => {
    setOptionsOnPage(result);

    let moveplannerPlusChildOptions = document.getElementsByClassName("js-requires-moveplanner-plus");
    for (let childOption of moveplannerPlusChildOptions) {
        childOption.disabled = !result.options_enable_moveplanner_plus;
    }

    let inputs = document.querySelectorAll("input");
    for (let input of inputs) {
        input.addEventListener("change", (event) => {
            let parsedOptions = parseOptionsFromPage();
            console.log("Updating options:", parsedOptions);
            chrome.storage.sync.set(parsedOptions);

            let moveplannerPlusDisabled = !parsedOptions.options_enable_moveplanner_plus;
            for (let childOption of moveplannerPlusChildOptions) {
                childOption.disabled = moveplannerPlusDisabled;
            }
        });
    }

    let resetDefaultsBtn = document.getElementById("reset-defaults-btn");
    resetDefaultsBtn.addEventListener("click", (event) => {
        chrome.storage.sync.set(kOptionDefaults, () => {
            setOptionsOnPage(kOptionDefaults);
        });
    });

    let form = document.getElementById("optionsForm");
    form.classList.remove("d-none");
});
