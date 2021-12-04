(function() {
    function patchUnitsInfo() {
        for (let unitId in unitsInfo) {
            let unit = unitsInfo[unitId];
            if (unit.hasOwnProperty("players_id") && !unit.hasOwnProperty("units_players_id")) {
                console.log("patching units_players_id for unit:", unit);
                unit.units_players_id = unit.players_id;
            }

            // TODO: check if the unit is on a capturable tile?
            let span = document.getElementById("unit_" + unitId);
            if (span) {
                let imgs = span.getElementsByTagName("img");
                for (let img of imgs) {
                    if (img.src.indexOf("capture") !== -1) {
                        console.log("patching units_capture for unit:", unit);
                        unit.units_capture = 1;
                    }
                }
            }
        }
    }

    // Patch the unitsInfo data structure when units are added to the map.
    let gamemap = document.getElementById("gamemap");
    let observer = new MutationObserver((mutations, observer) => {
        patchUnitsInfo();
    });
    observer.observe(gamemap, {subtree: true, childList: true});

    // Trigger initial patching even without any events.
    patchUnitsInfo();
})();
