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

const kDefaultBindings = {
    "rewind-turn": [72 /*h*/, 38 /*up*/],
    "rewind-action": [75 /*k*/, 37 /*left*/],
    "forward-action": [74 /*j*/, 39 /*right*/],
    "forward-turn": [76 /*l*/, 40 /*down*/],
};
const kDefaultOptions = {
    "bindings": kDefaultBindings
};

const options = {};
chrome.storage.sync.get({options: kDefaultOptions}, function(data) {
    console.log("Got result: ", data);
    Object.assign(options, data.options);
});

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


let keybindListener = new KeybindListener("keybind-instructions");
let keybindOptions = [];
for (let optionId in kDefaultBindings) {
    keybindOptions.push(new KeybindOption(optionId + "-1", keybindListener));
}


let kCheckOptionsMapping = [
    {id: "enable-replay-shortcuts",       name: "options_enable_replay_shortcuts",       default: true},
    {id: "enable-moveplanner-plus",       name: "options_enable_moveplanner_plus",       default: true},
    {id: "enable-savestate-interception", name: "options_enable_savestate_interception", default: true},
    {id: "enable-move-range-preview",     name: "options_enable_move_range_preview",     default: false},
];

let kRangeOptionsMapping = [
    {id: "menu-opacity-range", previewId: "menu-opacity-preview", name: "options_menu_opacity", default: 1},
    {id: "default-funding-range", previewId: "default-funding-preview", name: "options_default_funding",
            default: 1000}
];

let kAllOptionsMapping = kCheckOptionsMapping.concat(kRangeOptionsMapping);

for (let optionMapping of kRangeOptionsMapping) {
    let inputElement = document.getElementById(optionMapping.id);
    let previewElement = document.getElementById(optionMapping.previewId);
    if (inputElement && previewElement) {
        inputElement.addEventListener("input", () => {
            previewElement.value = inputElement.value;
        });
    }
    previewElement.value = inputElement.value;
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
            parsedOptions[optionMapping.name] = inputElement.value;
        }
    }

    return parsedOptions;
}

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
});
