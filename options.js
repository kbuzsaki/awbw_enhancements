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

let KeybindListener = (function(){
    let KeybindListener = function(id) {
        this.currentOption = undefined;
        this.keybindInstructions = document.getElementById(id);
        let that = this;
        document.addEventListener("keydown", (event) => {
            if (that.isActive()) {
                that.handleEvent(event);
            }
        });
    };

    KeybindListener.prototype.isActive = function() {
        return this.currentOption !== undefined;
    };

    KeybindListener.prototype.handleEvent = function(event) {
        console.log("Got keyCode:", event.keyCode,
            "(" + keyCodeToName(event.keyCode) + ") for option:", this.currentOption.optionId);

        let currentOption = this.currentOption;
        this.cancelListen();
        currentOption.handleKeybinding(event);
    };

    KeybindListener.prototype.listen = function(option) {
        this.cancelListen();
        this.currentOption = option;

        let name = this.currentOption.name();
        this.keybindInstructions.getElementsByTagName("span")[0].innerHTML = name;
        this.keybindInstructions.classList.remove("hidden");
    };

    KeybindListener.prototype.cancelListen = function() {
        if (this.currentOption !== undefined) {
            this.currentOption.cancelListen();
        }
        this.currentOption = undefined;
        this.keybindInstructions.classList.add("hidden");
    };

    return KeybindListener;
})();

let KeybindOption = (function(){
    let KeybindOption = function(optionId, keybindListener){
        this.optionId = optionId;
        this.keybindListener = keybindListener;

        this.input = document.getElementById(this.optionId);
        this.input.addEventListener("click", (event) => { this.onClick(event); });
    };

    KeybindOption.prototype.name = function() {
        return this.optionId;
    };

    KeybindOption.prototype.onClick = function(event) {
        console.log("clicked:", this.optionId);

        if (this.keybindListener.currentOption === this) {
            this.keybindListener.cancelListen();
        } else {
            this.startListen();
        }
    };

    KeybindOption.prototype.startListen = function() {
        this.input.classList.add("listening");
        this.keybindListener.listen(this);
    };

    KeybindOption.prototype.cancelListen = function() {
        this.input.classList.remove("listening");
    };

    KeybindOption.prototype.handleKeybinding = function(event) {
        console.log("event delivered to option: ", this.optionId);
    };

    KeybindOption.prototype.setDisplayedBindings = function(bindings) {
        let text = "";
    };

    return KeybindOption;
})();


let keybindListener = new KeybindListener("keybind-instructions");

let keybindOptions = [];
for (let optionId in kDefaultBindings) {
    keybindOptions.push(new KeybindOption(optionId, keybindListener));
}
