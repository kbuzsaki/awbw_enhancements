OptionsReader.instance().onOptionsReady((options) => {
    if (!options.options_enable_speedy_event_panel) {
        console.log("Speedy event panel disabled.");
        return;
    }
    console.log("Speedy event panel enabled.");

    function injectSpeedOverrideStyle(speedMs) {
        let speedSeconds = speedMs / 1000;

        let s = document.createElement("style");
        s.innerHTML = `
        .event-screen-open {
            animation: anim-open-event-screen ${speedSeconds}s linear forwards;
        }`;
        (document.head || document.documentElement).appendChild(s);

        return s;
    }

    let eventScreen = document.querySelector(".event-screen");
    let eventScreenContainer = document.querySelector(".event-screen-container");
    if (!eventScreen || !eventScreenContainer) {
        console.log("Failed to find either event-screen or event-screen-container, aborting speedy event panel.");
        return;
    }

    let speedMs = options.options_event_panel_speed_ms;

    injectSpeedOverrideStyle(speedMs);

    let previousEventScreenState = eventScreenContainer.classList.contains("event-screen-open");
    let observer = new MutationObserver((mutations, observer) => {
        let eventScreenState = eventScreenContainer.classList.contains("event-screen-open");
        if (eventScreenState && !previousEventScreenState) {
            setTimeout(() => {
                eventScreen.click();
            }, speedMs);
        }
        previousEventScreenState = eventScreenState;
    });
    observer.observe(eventScreenContainer, {attributes: true});
});
