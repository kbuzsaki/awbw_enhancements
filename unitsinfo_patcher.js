(function() {
    function patchUnitsInfo() {
        for (let unitId in unitsInfo) {
            let unit = unitsInfo[unitId];
            if (unit.hasOwnProperty("players_id") && !unit.hasOwnProperty("units_players_id")) {
                console.log("patching units_players_id for unit:", unit);
                unit.units_players_id = unit.players_id;
            }

            // TODO: refine / de-jank this? Should players be able to force it?
            let span = document.getElementById("unit_" + unitId);
            if (span) {
                let imgs = span.getElementsByTagName("img");
                for (let img of imgs) {
                    if (img.src.indexOf("capture") !== -1) {
                        // Check if the capture is valid
                        let building = buildingsInfo[unit.units_x][unit.units_y];
                        if (!building) {
                            console.log("removing capture indicator unit that is not on property:", unit);
                            img.remove();
                        } else if (unit.countries_code === building.countries_code) {
                            console.log("removing capture indicator for owned property:", unit);
                            img.remove();
                        } else if (unit.units_capture !== 1) {
                            console.log("patching units_capture for unit:", unit);
                            unit.units_capture = 1;
                        } else {
                            // State matches up
                        }
                    }
                }
            }
        }
    }

    // Patch the unitsInfo data structure when units are added to the map.
    let gamemap = document.getElementById("gamemap");
    let observer = new MutationObserver((mutations, observer) => {
        // Ignore cursor-only mutations
        let isInteresting = false;
        for (let mutation of mutations) {
            if (mutation.target.id != "cursor") {
                isInteresting = true;
                break;
            }
        }

        patchUnitsInfo();
    });
    observer.observe(gamemap, {subtree: true, childList: true});

    // Trigger initial patching even without any events.
    patchUnitsInfo();
})();
