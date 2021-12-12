const kNameOverrides = {
    37: "LEFT",
    38: "UP",
    39: "RIGHT",
    40: "DOWN"
};
function keyCodeToName(keyCode) {
    keyCode = keyCode+0;
    let override = kNameOverrides[keyCode];
    if (override !== undefined) { return override; }
    let other = String.fromCharCode(keyCode);
    return other;
}

class KeybindListener {
    constructor(id) {
        this.currentOption = undefined;
        this.keybindInstructions = document.getElementById(id);
        let that = this;
        document.addEventListener("keydown", (event) => {
            if (that.isActive()) {
                that.handleEvent(event);
            }
        });
    }

    isActive() { return this.currentOption !== undefined; }

    handleEvent(event) {
        console.log("Got keyCode:", event.keyCode,
            "(" + keyCodeToName(event.keyCode) + ") for option:", this.currentOption.optionId);

        let currentOption = this.currentOption;
        this.cancelListen();
        currentOption.handleKeybinding(event);
    }

    listen(option) {
        this.cancelListen();
        this.currentOption = option;

        let name = this.currentOption.name();
        this.keybindInstructions.getElementsByTagName("span")[0].innerHTML = name;
        this.keybindInstructions.classList.remove("hidden");
    }

    cancelListen() {
        if (this.currentOption !== undefined) {
            this.currentOption.cancelListen();
        }
        this.currentOption = undefined;
        this.keybindInstructions.classList.add("hidden");
    }
}

class KeybindOption {
    constructor(optionId, keybindListener){
        this.optionId = optionId;
        this.keybindListener = keybindListener;

        this.input = document.getElementById(this.optionId);
        this.input.addEventListener("click", (event) => { this.onClick(event); });
    }

    name() { return this.optionId; }

    onClick(event) {
        console.log("clicked:", this.optionId);

        if (this.keybindListener.currentOption === this) {
            this.keybindListener.cancelListen();
        } else {
            this.startListen();
        }
    }

    startListen() {
        this.input.classList.add("listening");
        this.keybindListener.listen(this);
    }

    cancelListen() {
        this.input.classList.remove("listening");
    }

    handleKeybinding(event) {
        console.log("event delivered to option: ", this.optionId);
    }

    setDisplayedBindings(bindings) {
        let text = "";
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
        id: "enable-move-range-preview",
        name: "options_enable_move_range_preview",
        requires: ["js-requires-moveplanner-plus"],
        default: false,
        label: "Enable Move Range Preview [Work in Progress]",
        description: [
            `Adds a movement range preview when selecting units in the moveplanner.`,
            `This feature is not fully implemented yet. It does not handle CO Power movement boosts ` +
            `and it will likely never handle fuel.`
        ],
    }, {
        id: "enable-bugfix-unwait-all",
        name: "options_enable_bugfix_unwait_all",
        default: true,
        label: 'Fix "Unwait All" for Moved Units',
        description: [
            `Fixes the "Unwait All" button not unwaiting units that were already moved that turn before ` +
            `the moveplanner was opened.`
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
        id: "enable-bugfix-extra-capture-icons",
        name: "options_enable_bugfix_extra_capture_icons",
        default: true,
        label: 'Fix Extra "Capture" Icons',
        description: [
            `Fixes extra "capture" icons being displayed for infantry that already finished capturing.`
        ],
    }, {
        // TODO: implement this bugfix in unitsinfo_patcher.js
        id: "enable-bugfix-encoded-sprite-urls",
        name: "options_enable_bugfix_encoded_sprite_urls",
        default: true,
        label: 'Fix Broken Black Boat Sprites',
        description: [
            `Fixes Black Boat sprites displaying incorrectly after savestate reload.`,
        ],
    }, {
        id: "enable-bugfix-missing-units-players-id",
        name: "options_enable_bugfix_missing_units_players_id",
        default: true,
        label: 'Fix Damage Calculator Selection',
        description: [
            `Fixes the bug where units built in the moveplanner cannot be selected with the damage calculator.`
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
        default: 1,
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
        default: [72 /*h*/, 38 /*up*/],
        label: "Rewind Turn",
        description: [],
    }, {
        id: "rewind-action",
        default: [75 /*k*/, 37 /*left*/],
        label: "Rewind Action",
        description: [],
    }, {
        id: "forward-action",
        default: [74 /*j*/, 39 /*right*/],
        label: "Forward Action",
        description: [],
    }, {
        id: "forward-turn",
        default: [76 /*l*/, 40 /*down*/],
        label: "Forward Turn",
        description: [],
    },
];

let kAllOptionsMapping = kCheckOptionsMapping.concat(kRangeOptionsMapping);


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
</div>`;
}

function initializeKeyboardOptions() {
    // TODO: actually implement keybinding customization for keyboard shortcuts
    let keybindListener = new KeybindListener("keybind-instructions");
    let keybindOptions = [];
    for (let optionMapping of kKeyboardOptionsMapping) {
        let container = document.getElementById(optionMapping.id + "-container");
        container.innerHTML = templateKeyboardOption(optionMapping);

        keybindOptions.push(new KeybindOption(optionMapping.id + "-1", keybindListener));
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
        input.addEventListener("input", (event) => {
            let parsedOptions = parseOptionsFromPage();
            console.log("Updating options:", parsedOptions);
            chrome.storage.sync.set(parsedOptions);

            let moveplannerPlusDisabled = !parsedOptions.options_enable_moveplanner_plus;
            for (let childOption of moveplannerPlusChildOptions) {
                childOption.disabled = moveplannerPlusDisabled;
            }
        });
    }

    let form = document.getElementById("optionsForm");
    form.classList.remove("d-none");
});
