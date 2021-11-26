
const kDefaultBindings = {
    "rewind-turn": [72 /*h*/, 38 /*up*/],
    "rewind-action": [75 /*k*/, 37 /*left*/],
    "forward-action": [74 /*j*/, 39 /*right*/],
    "forward-turn": [76 /*l*/, 40 /*down*/],
};

function convertBindingsToMapping(bindings) {
    let newMapping = {};
    for (let binding in bindings) {
        for (let keyCode of bindings[binding]) {
            newMapping[keyCode] = binding;
        }
    }
    return newMapping;
}

let mapping = {};
function updateMapping(bindings) {
    mapping = convertBindingsToMapping(bindings);
    console.log("AWBW Helper now using key mapping: ", mapping);
}
updateMapping(kDefaultBindings);

chrome.storage.onChanged.addListener((changes, area) => {
    if (area === "sync") {
        console.log(changes);
    }
});

let rewindTurn = document.getElementsByClassName("replay-backward")[0];
let rewindAction = document.getElementsByClassName("replay-backward-action")[0];
let forwardAction = document.getElementsByClassName("replay-forward-action")[0];
let forwardTurn = document.getElementsByClassName("replay-forward")[0];

function handleKeyDown(event) {
    if (event.ctrlKey || event.shiftKey || event.altKey || event.metaKey) {
        return;
    }
    let binding = mapping[event.keyCode];
    if (binding === "rewind-turn") {
        if (rewindTurn) {
            rewindTurn.click();
            event.preventDefault();
        }
    } else if (binding === "rewind-action") {
        if (rewindAction) {
            rewindAction.click();
            event.preventDefault();
        }
    } else if (binding === "forward-action") {
        if (forwardAction) {
            forwardAction.click();
            event.preventDefault();
        }
    } else if (binding === "forward-turn") {
        if (forwardTurn) {
            forwardTurn.click();
            event.preventDefault();
        }
    } else {
        // unrecognized key
    }
}

document.addEventListener("keydown", handleKeyDown);

