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
    console.log("Patcher observed buildingsInfo:", buildingsInfo);

    function getUrlWithWaitedState(url, waited) {
        return url.replace(/["a-z-._"]+.gif/, (match) => {
            if (waited && !match.match("gs_")) {
                return "gs_" + match;
            } else if (!waited && match.match("gs_")) {
                return match.replace("gs_", "");
            }
            return match;
        });
    }

    function patchUnitsInfo() {
        for (let unitId in unitsInfo) {
            let unit = unitsInfo[unitId];

            if (options.options_enable_bugfix_missing_units_players_id) {
                if (unit.hasOwnProperty("players_id") && !unit.hasOwnProperty("units_players_id")) {
                    console.log("patching units_players_id for unit:", unit);
                    unit.units_players_id = unit.players_id;
                }

                // Tack this fix onto the players id option because units built in the vanilla move planner
                // aren't selectable in the first place, so this fix is only revealed then.
                if (!unit.hasOwnProperty("units_ammo")) {
                    console.log("patching units_ammo for unit:", unit);
                    // The actual ammo value doesn't matter as long as it's not zero.
                    unit.units_ammo = 1;
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
                let imgs = span.getElementsByTagName("img");
                // Need to patch broken black boat sprite before wait fixing waited-ness of the sprite
                // so that the name parsing works correctly there.
                if (options.options_enable_bugfix_encoded_sprite_urls) {
                    // Patch broken black boat sprite
                    for (let img of imgs) {
                        if (img.src.indexOf("%20") !== -1) {
                            console.log("patching suspected broken img url:", img.src);
                            img.src = img.src.replace("%20", "");
                        }
                    }
                }

                // The savestate restore constructs the image URL with concatenation, but the actual
                // question mark HP sprite has a different name.
                if (options.options_enable_bugfix_broken_sonja_hp) {
                    for (let img of imgs) {
                        if (img.src.endsWith("/?.gif")) {
                            let fixedHpImgSrc = img.src.replace("/?.gif", "/qhp.gif");
                            img.src = fixedHpImgSrc;
                        }
                    }
                }

                if (options.options_enable_bugfix_wait_mismatch) {
                    // This feels janky, but it's what the moveplanner code does?
                    let unitImg = span.firstChild;
                    if (unitImg) {
                        // Prefer unit.moved because it's the waited state used by the moveplanner, but fall
                        // back to unit.units_moved because unit.moved may not be set.
                        // (See the options_enable_bugfix_unwait_all patch above)
                        let isWaited = unit.hasOwnProperty("moved") ? unit.moved : unit.units_moved;
                        // Make sure that the unit's image reflects its waited state.
                        let fixedUnitImgSrc = getUrlWithWaitedState(unitImg.src, isWaited);
                        if (unitImg.src !== fixedUnitImgSrc) {
                            console.log("Patching unit sprite waitedness:", unit);
                            unitImg.src = fixedUnitImgSrc;
                        }
                    }
                }

                if (options.options_enable_bugfix_extra_capture_icons) {
                    for (let img of imgs) {
                        // TODO: refine / de-jank this? Should players be able to force it?
                        if (img.src.indexOf("capture") !== -1) {
                            // Check if the capture is valid
                            let building = buildingsInfo[unit.units_x]?.[unit.units_y];
                            if (!building) {
                                console.log("removing capture indicator for unit that is not on property:", unit);
                                img.remove();
                                continue;
                            }

                            let buildingCountriesCode = building.countries_code;
                            if (building.hasOwnProperty("terrain_country_code")) {
                                buildingCountriesCode = building.terrain_country_code;
                            }

                            if (unit.countries_code === buildingCountriesCode) {
                                console.log("removing capture indicator for unit on owned property:", unit);
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
    }
    function isHidableInFog(building_url) {
        const kGoodFragments = ["neutral", "hq", "rubble", "silo"];
        for (let fragment of kGoodFragments) {
            if (building_url.indexOf(fragment) !== -1) {
                return true;
            }
        }
        return false;
    }
    function patchBuildings() {
        if (options.options_enable_bugfix_revealed_neutral_fog_buildings) {
            if (buildingsInfo && fogArray) {
                for (let x in buildingsInfo) {
                    let col = buildingsInfo[x];
                    for (let y in col) {
                        let building = col[y];
                        let fogValue = fogArray?.[x]?.[y];
                        if (fogValue === 0) {
                            let buildingElement = document.getElementById("building_" + building.buildings_id);
                            if (buildingElement) {
                                let img = buildingElement.firstChild;
                                if (img && img.src && isHidableInFog(img.src)) {
                                    let fixedImgSrc = getUrlWithWaitedState(img.src, /*waited=*/true);
                                    if (img.src !== fixedImgSrc) {
                                        console.log("Patching building that should be in fog:", building);
                                        img.src = fixedImgSrc;
                                    }
                                }
                            }
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
        patchBuildings();
    });
    observer.observe(gamemap, {subtree: true, childList: true});

    // Trigger initial patching even without any events.
    patchUnitsInfo();
    patchBuildings();
})();
