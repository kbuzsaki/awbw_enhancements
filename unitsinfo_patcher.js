(function() {
    let options = (() => {
        let firstHash = document.currentScript.src.indexOf("#");
        if (firstHash === -1) return {};
        let optionsJson = document.currentScript.src.substring(firstHash+1);
        return JSON.parse(decodeURIComponent(optionsJson));
    })();
    console.log("Patcher observed options:", options);
    console.log("Patcher observed unitMap:", unitMap);
    console.log("Patcher observed unitsInfo:", unitsInfo);

    function patchUnitsInfo() {
        for (let unitId in unitsInfo) {
            let unit = unitsInfo[unitId];

            if (options.options_enable_bugfix_missing_units_players_id) {
                if (unit.hasOwnProperty("players_id") && !unit.hasOwnProperty("units_players_id")) {
                    console.log("patching units_players_id for unit:", unit);
                    unit.units_players_id = unit.players_id;
                }
            }

            if (options.options_enable_bugfix_unwait_all) {
                // The unit.units_moved property is authoritative on page load.
                // However, the move planner uses the unit.moved property for its logic, so sync over to that.
                // This fixes the bug where the "Unwait All" button does not unwait some units.
                if (unit.hasOwnProperty("units_moved") && !unit.hasOwnProperty("moved")) {
                    console.log("patching moved for unit:", unit);
                    unit.moved = unit.units_moved;
                }
            }

            let span = document.getElementById("unit_" + unitId);
            if (span) {
                if (options.options_enable_bugfix_wait_mismatch) {
                    // This feels janky, but it's what the moveplanner code does?
                    let unitImg = span.firstChild;
                    if (unitImg) {
                        // Make sure that the unit's image reflects its waited state.
                        let fixedUnitImgSrc = unitImg.src.replace(/["a-z-._"]+.gif/, (match) => {
                            if (unit.moved && !match.match("gs_")) {
                                return "gs_" + match;
                            } else if (!unit.moved && match.match("gs_")) {
                                return match.replace("gs_", "");
                            }
                            return match;
                        });
                        if (unitImg.src !== fixedUnitImgSrc) {
                            unitImg.src = fixedUnitImgSrc;
                        }
                    }
                }

                let imgs = span.getElementsByTagName("img");
                if (options.options_enable_bugfix_extra_capture_icons) {
                    for (let img of imgs) {
                        // TODO: refine / de-jank this? Should players be able to force it?
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
                if (options.options_enable_bugfix_encoded_sprite_urls) {
                    // Patch broken black boat sprite
                    for (let img of imgs) {
                        if (img.src.indexOf("%20") !== -1) {
                            console.log("patching suspected broken img url:", img.src);
                            img.src = img.src.replace("%20", "");
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
