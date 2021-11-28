/*
{
    "users_username": "saltor",
    "players_id": 1299238,
    "players_team": "1299238",
    "players_countries_id": 1,
    "players_eliminated": "N",
    "players_co_id": 22,
    "co_name": "Jake",
    "co_max_power": 270000,
    "co_max_spower": 540000,
    "players_co_power": 0,
    "players_co_power_on": "N",
    "players_co_max_power": 270000,
    "players_co_max_spower": 540000,
    "players_co_image": "jake.png",
    "players_funds": 11000,
    "countries_code": "os",
    "countries_name": "Orange Star",
    "cities": 8,
    "labs": 0,
    "towers": 0,
    "other_buildings": 11,
    "players_turn_clock": 1896396,
    "players_turn_start": "2021-11-25 19:56:14",
    "players_order": 19,
    "players_income": 11000
}
 */


// Initialize to undefined to catch illegal use before we initialize it properly.
let fundsPerProperty = undefined;

function makeFakePlayerInfo(country, funds, isFirst) {
    return {
        users_username: country.name,
        players_id: 0,
        co_name: "Andy",
        co_max_power: 270000,
        co_max_spower: 540000,
        players_funds: funds,
        countries_code: country.code,
        countries_name: country.name,
        is_current_turn: isFirst,
    };
}

function getInitialPlayerState(mapEntities) {
    let propertiesByCountry =
        partitionBy(mapEntities.properties, (property) => property.country.code);

    let players = scrapePlayersInfo();
    if (players.length !== 0) {
        let latestPlayer = undefined;
        let latestPlayerStartTime = 0;
        for (let playerInfo of players) {
            let startTime = Date.parse(playerInfo.players_turn_start);
            if (startTime > latestPlayerStartTime) {
                latestPlayer = playerInfo;
                latestPlayerStart = startTime;
            }
            playerInfo.is_current_turn = false;

            // If income is set and non-zero, try to infer the funding level
            if (playerInfo.players_income && !fundsPerProperty) {
                let properties = propertiesByCountry[playerInfo.countries_code];
                let incomeProperties = properties.filter((p) => p.producesIncome()).length;
                fundsPerProperty = playerInfo.players_income / incomeProperties;
            }
        }
        latestPlayer.is_current_turn = true;

        if (!fundsPerProperty) {
            fundsPerProperty = kDefaultFundingLevel;
        }
    } else {
        // If there's no player data, fabricate some based on the predeployed properties.
        fundsPerProperty = kDefaultFundingLevel;

        let isFirst = true;
        for (let country of kCountries) {
            if (country.flatName === "neutral"
             || !propertiesByCountry.hasOwnProperty(country.code)) {
                continue;
            }

            let funds = 0;
            if (isFirst) {
                let properties = propertiesByCountry[country.code];
                let incomeProperties = properties.filter((p) => p.producesIncome()).length;
                funds = incomeProperties * fundsPerProperty;
            }

            players.push(makeFakePlayerInfo(country, funds, isFirst));
            isFirst = false;
        }
    }

    return players;
}

let gamemap = document.getElementById("gamemap");
if (gamemap !== undefined) {
    let parser = new GameStateParser(gamemap);

    let removedUnitsPanel = document.getElementById("planner_removed_units");
    if (removedUnitsPanel) {
        let mapEntities = parser.parseMapEntities();
        let players = getInitialPlayerState(mapEntities);

        let playersPanel = new PlayersPanel(removedUnitsPanel, players);
        parser.addListener((mapEntities) => {
            playersPanel.handleUpdate(mapEntities);
        });

        let buildMenu = document.getElementById("build-menu");
        let buildMenuListener = new BuildMenuListener(buildMenu, mapEntities.properties);
        parser.addListener((mapEntities) => {
            buildMenuListener.onMapUpdate(mapEntities);
        });
        buildMenuListener.addUnitBuildListener((property, builtUnit) => {
            playersPanel.handleUnitBuilt(property, builtUnit);
        });

        let loadStateInput = document.getElementById("load-state-input");
        loadStateInput.addEventListener("change", () => {
            let file = loadStateInput.files[0];

            const reader = new FileReader();
            reader.onload = function(event) {
                let savestateData = JSON.parse(event.target.result);
                console.log("savestate loaded:", savestateData);
            };
            reader.readAsText(file);
        });
    }

    let throttler = new UpdateThrottler(kDefaultThrottleMs, () => {
        parser.handleMapUpdate();
    });
    let observer = new MutationObserver((mutations, observer) => {
        // Ignore cursor-only mutations, they can't affect game state.
        let isInteresting = false;
        for (let mutation of mutations) {
            if (mutation.target.id != "cursor") {
                isInteresting = true;
                break;
            }
        }

        if (isInteresting) {
            throttler.handleUpdate();
        }
    });
    observer.observe(gamemap, {subtree: true, childList: true, attributes: true});

    // Initial ping to grab state if there are no other events
    throttler.handleUpdate();
}

// Handler for rewriting savestate downloads that are intercepted by the service worker.
chrome.runtime.onMessage.addListener((message, sender) => {
    if (message.type !== "savestate_download") return;

    // Download the intercepted savestate ourselves
    let xhr = new XMLHttpRequest();
    xhr.addEventListener("load", (event) => {
        // Parse the data out as json and add our extra data
        // TODO: consider patching actual savestate data to fix the broken image bug?
        let savestateData = JSON.parse(xhr.responseText);
        // TODO: hook in actual awbw helper state that we need to persist
        savestateData["awbw_helper_extras"] = {todo: "data goes here"};

        // Then restart the download with a sentinel so that it isn't intercepted as well.
        const url = window.URL.createObjectURL(
            new Blob([JSON.stringify(savestateData)], {type: "application/json"}));
        const a = document.createElement("a");
        a.href = url + "#awbw_helper_modified";
        a.download = message.filename;
        document.body.appendChild(a);
        a.click();
    });
    xhr.open("GET", message.finalUrl, true);
    xhr.send();
});
