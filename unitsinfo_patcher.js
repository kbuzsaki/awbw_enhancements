(function() {
    // Patch the unitsInfo data structure when units are added to the map.
    let gamemap = document.getElementById("gamemap");
    let observer = new MutationObserver((mutations, observer) => {
        for (let unitId in unitsInfo) {
            let unit = unitsInfo[unitId];
            if (unit.hasOwnProperty("players_id") && !unit.hasOwnProperty("units_players_id")) {
                unit.units_players_id = unit.players_id;
            }
        };
    });
    observer.observe(gamemap, {subtree: true, childList: true});
})();
