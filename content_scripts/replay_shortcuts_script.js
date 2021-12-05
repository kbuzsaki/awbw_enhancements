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

let optionsReader = new OptionsReader();
optionsReader.onOptionsReady((result) => {
    if (!result.options_enable_replay_shortcuts) {
        console.log("Repaly keyboard shortcuts disabled.");
        return;
    }

    let mapping = convertBindingsToMapping(kDefaultBindings);

    let rewindTurn = document.getElementsByClassName("replay-backward")[0];
    let rewindAction = document.getElementsByClassName("replay-backward-action")[0];
    let forwardAction = document.getElementsByClassName("replay-forward-action")[0];
    let forwardTurn = document.getElementsByClassName("replay-forward")[0];

    function handleKeyDown(event) {
        // The "game page" and the "replay page" are actually the same page,
        // with no page load in between.
        // Check the URL for a replay index to see if we're in replay mode.
        // TODO: find a better way to check if we're in replay mode?
        if (window.location.href.indexOf("&ndx=") === -1) {
            return;
        }
        // Ignore modifier keys
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
});
