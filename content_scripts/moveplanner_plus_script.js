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
                latestPlayerStartTime = startTime;
            }
            playerInfo.is_current_turn = false;

            // If income is set and non-zero, try to infer the funding level
            if (playerInfo.players_income && !fundsPerProperty) {
                let properties = propertiesByCountry[playerInfo.countries_code];
                let incomeProperties = properties.filter((p) => p.producesIncome()).length;
                fundsPerProperty = playerInfo.players_income / incomeProperties;
                if (playerInfo.co_name === "Sasha") {
                    fundsPerProperty -= 100;
                }
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

// TODO: support for "undo"
// TODO: better support for sonja somehow? at least bugfixing NaNs and broken images
// TODO: broken snapshot for fog?
// TODO: unit movement ranges
// TODO: "reinforcement time heat map" for different movement types
//
let gamemap = document.getElementById("gamemap");
let replayContainer = document.getElementById("replay-container");
if (gamemap && replayContainer) {
    let parser = new GameStateParser(gamemap);
    let initialMapEntities = parser.parseMapEntities();
    let players = getInitialPlayerState(initialMapEntities);

    // TODO: consider inserting the players panel before the removed units panel,
    // rather than after it.
    let playersPanel = new PlayersPanel(replayContainer, players);
    parser.addListener((mapEntities) => {
        playersPanel.handleUpdate(mapEntities);
    });

    let buildMenu = document.getElementById("build-menu");
    let buildMenuListener = new BuildMenuListener(buildMenu, initialMapEntities.properties);
    parser.addListener((mapEntities) => {
        buildMenuListener.onMapUpdate(mapEntities);
    });
    buildMenuListener.addUnitBuildListener((property, builtUnit) => {
        playersPanel.handleUnitBuilt(property, builtUnit);
    });

    let loadStateInput = document.getElementById("load-state-input");
    let savestateInterceptor = new SavestateInterceptor(loadStateInput, [playersPanel]);

    let controlsTable = document.getElementById("game-controls-table");
    let savestateManager = new SavestateManager(controlsTable, savestateInterceptor);
    playersPanel.addTurnStartListener(savestateManager.onTurnStart.bind(savestateManager));

    // TODO: determine whether having no throttle rate is acceptable now that we ignore
    // cursor events and only run on the moveplanner.
    let throttleMs = 0;
    let throttler = new UpdateThrottler(throttleMs, () => {
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

    // TODO: does this race with the unitsinfo patching?
    playersPanel.startFirstTurn();
}

(function(){
    let snapshotElement = document.createElement("div");
    snapshotElement.id = "awbw_helper-savestate-snapshot";
    document.body.appendChild(snapshotElement);

    function injectScript(scriptName) {
        let s = document.createElement("script");
        s.src = chrome.runtime.getURL(scriptName);
        s.onload = function() { this.remove(); };
        (document.head || document.documentElement).appendChild(s);
    }
    // TODO: add settings for controlling which patches are injected?
    injectScript("savestate_injector.js");
    injectScript("unitsinfo_patcher.js");
})();
