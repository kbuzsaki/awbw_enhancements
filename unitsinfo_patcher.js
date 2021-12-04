(function() {
    function patchUnitsInfo() {
        for (let unitId in unitsInfo) {
            let unit = unitsInfo[unitId];
            if (unit.hasOwnProperty("players_id") && !unit.hasOwnProperty("units_players_id")) {
                console.log("patching units_players_id for unit:", unit);
                unit.units_players_id = unit.players_id;
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
