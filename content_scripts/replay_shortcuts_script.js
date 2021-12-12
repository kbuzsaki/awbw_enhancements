function convertBindingsToMapping(bindings) {
    let newMapping = {};
    for (let binding in bindings) {
        for (let keyCode of bindings[binding]) {
            newMapping[keyCode] = binding;
        }
    }
    return newMapping;
}

function getMappingFromOptions(options) {
    let bindings = {
        "rewind-turn":    options.options_bindings_rewind_turn || [],
        "rewind-action":  options.options_bindings_rewind_action || [],
        "forward-action": options.options_bindings_forward_action || [],
        "forward-turn":   options.options_bindings_forward_turn || [],
    };

    return convertBindingsToMapping(bindings);
}

OptionsReader.instance().onOptionsReady((options) => {
    if (!options.options_enable_replay_shortcuts) {
        console.log("Replay keyboard shortcuts disabled.");
        return;
    }

    let mapping = getMappingFromOptions(options);
    console.log("Replay shortcuts using mapping:", mapping);

    let rewindTurn = document.querySelector(".replay-backward");
    let rewindAction = document.querySelector(".replay-backward-action");
    let forwardAction = document.querySelector(".replay-forward-action");
    let forwardTurn = document.querySelector(".replay-forward");

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
