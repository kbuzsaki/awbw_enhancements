// TODO: track clicks on the build menu for funds deduction?
// TODO: how to refund them for mistaken purchases? undo last purchase button + stack?
// TODO: button for incrementing income

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

let gamemap = document.getElementById("gamemap");
if (gamemap !== undefined) {
    let parser = new GameStateParser(gamemap);

    let removedUnitsPanel = document.getElementById("planner_removed_units");
    if (removedUnitsPanel) {
        let mapEntities = parser.parseMapEntities();
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
            for (let countryCode in propertiesByCountry) {
                let country = kCountriesByCode[countryCode];
                if (country.flatName == "neutral") {
                    continue;
                }

                let funds = 0;
                if (isFirst) {
                    let properties = propertiesByCountry[countryCode];
                    let incomeProperties = properties.filter((p) => p.producesIncome()).length;
                    funds = incomeProperties * fundsPerProperty;
                }

                players.push({
                    users_username: country.name,
                    players_id: 0,
                    co_name: "Andy",
                    co_max_power: 270000,
                    co_max_spower: 540000,
                    players_funds: funds,
                    countries_code: country.code,
                    countries_name: country.name,
                    is_current_turn: isFirst,
                });

                isFirst = false;
            }
        }

        let playerInfoContainer = htmlToNode(`<div class="game-player-info" style="height: 160px; flex-wrap: nowrap; left: 100%; position: static; margin-left: 20px; overflow-y: visible; width: auto;">`);
        removedUnitsPanel.appendChild(playerInfoContainer);

        let playerPanels = {};
        for (let playerInfo of players) {
            let playerPanel = new PlayerPanel(playerInfoContainer, playerInfo);
            playerPanels[playerInfo.countries_code] = playerPanel;
        }

        parser.addListener((mapEntities) => {
            let propertiesByCountry =
                partitionBy(mapEntities.properties, (property) => property.country.code);
            let unitsByCountry =
                partitionBy(mapEntities.units, (unit) => unit.country.code);

            for (let playerId in playerPanels) {
                let playerPanel = playerPanels[playerId];
                let countryCode = playerPanel.playerInfo.countries_code;
                let properties = propertiesByCountry[countryCode] || [];
                let units = unitsByCountry[countryCode] || [];
                playerPanel.setMapInfo(properties, units);
            }
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

