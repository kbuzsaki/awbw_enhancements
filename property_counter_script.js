function parseIdFromResourceUrl(url) {
    return url.split("/").at(-1).split(".").at(0);
}

const kSpecialNeutralTiles = [
  "missilesilo",
  "missilesiloempty",
  "hpipeseam",
  "vpipeseam",
];
function parseCountryFromId(id) {
    if (kSpecialNeutralTiles.indexOf(id) !== -1) {
        let country = kCountries[0];
        let remainder = id;
        return {country, remainder};
    }
    for (let country of kCountries) {
        if (id.startsWith(country.code)) {
            let remainder = id.substr(country.code.length);
            return {country, remainder};
        } else if (id.startsWith(country.flatName)) {
            let remainder = id.substr(country.flatName.length);
            return {country, remainder};
        }
    }
    throw "Failed to parse country from id: '" + id + "'";
}

class Property {
    constructor(country, tile) {
        this.country = country;
        this.tile = tile;
    }

    static fromImage(src) {
        let id = parseIdFromResourceUrl(src);
        let {country, remainder} = parseCountryFromId(id);
        return new Property(country, remainder);
    }

    producesIncome() {
        return ["hq", "city", "base", "airport", "port"].indexOf(this.tile) !== -1;
    }
}

class Unit {
    constructor(country, unit, hp, others) {
        this.country = country;
        this.unit = unit;
        this.hp = hp;
        this.others = others;
    }

    static fromImages(srcs) {
        // assume that the first src is the unit itself
        let id = parseIdFromResourceUrl(srcs[0]);
        let {country, remainder} = parseCountryFromId(id);

        let hp = "";
        let others = [];
        for (let src of srcs.slice(1)) {
            let id = parseIdFromResourceUrl(src);
            if (id == "?" || !isNaN(id)) {
                hp = id;
            } else {
                others.push(id);
            }
        }

        return new Unit(country, remainder, hp, others);
    }
}

class GameStateParser {
    constructor(gamemap) {
        this.gamemap = gamemap;
        this.listeners = [];
    }

    addListener(listener) {
        this.listeners.push(listener);
    }

    handleMapUpdate() {
        let mapEntities = this.parseMapEntities();
        for (let listener of this.listeners) {
            listener(mapEntities);
        }
    }

    parseMapEntities() {
        function isPropertyElement(element) {
            return element.id?.startsWith("building")
                || element.classList?.contains("game-building");
        }
        function isUnitElement(element) {
            return element.id?.startsWith("unit")
                || element.classList?.contains("game-unit");
        }
        function parseEntityImages(element) {
            let images = element.getElementsByTagName("img");
            let srcs = [];
            for (let image of images) {
                srcs.push(image.src);
            }
            return srcs;
        }
        function parseProperty(element) {
            // TODO: get coordinates
            let srcs = parseEntityImages(element);
            return Property.fromImage(srcs[0]);
        }
        function parseUnit(element) {
            // TODO: get coordinates
            let srcs = parseEntityImages(element);
            return Unit.fromImages(srcs);
        }

        let mapEntities = {
            properties: [],
            units: [],
        };

        let dynamicElements = this.gamemap.getElementsByTagName("span");
        for (let element of dynamicElements) {
            if (isPropertyElement(element)) {
                mapEntities.properties.push(parseProperty(element));
            } else if (isUnitElement(element)) {
                mapEntities.units.push(parseUnit(element));
            }
        }

        return mapEntities;
    }
}

const kBaseTable = `
<table width="100%" style="margin-top: 10px"><tbody><tr>
  <td class="bordertitle" height="25" width="100%" style="font-size: 16px;">
    <!--
    <div class="reverse-info-box">?
      <span class="info-box-text" style="top: 20px;">
        Click on a unit to put<br> it back from where<br> it was removed
      </span>
    </div>
    -->
    <b>Properties</b>
  </td>
</tr><tr>
  <td class="borderwhite" width="100%" style="padding-top: 5px;">
  </td>
</tr></tbody></table>`;

class PropertyStatsPanel {
    constructor(parentPanel) {
        this.parentPanel = parentPanel;

        /*
        let placeholder = document.createElement("html");
        placeholder.innerHTML += kBaseTable;
        this.parentPanel.appendChild(placeholder.getElementsByTagName("table")[0]);
        */
    }

    updateWithEntities(mapEntities) {
        console.log("map entities:", mapEntities);

        let propertiesByCountry = {};
        for (let property of mapEntities.properties) {
            if (!propertiesByCountry.hasOwnProperty(property.country.code)) {
                propertiesByCountry[property.country.code] = [];
            }
            propertiesByCountry[property.country.code].push(property);
        }

        console.log("properties by country: ", propertiesByCountry);
    }
}

// TODO: track clicks on the build menu for funds deduction?
// TODO: how to refund them for mistaken purchases? undo last purchase button + stack?
// TODO: button for incrementing income


let gamemap = document.getElementById("gamemap");
if (gamemap !== undefined) {
    let parser = new GameStateParser(gamemap);

    let removedUnitsPanel = document.getElementById("planner_removed_units");
    if (removedUnitsPanel !== undefined) {
        let statsPanel = new PropertyStatsPanel(removedUnitsPanel);
        parser.addListener((mapEntities) => {
            statsPanel.updateWithEntities(mapEntities);
        });

        let playersInfo = scrapePlayersInfo();
        console.log(playersInfo);
        let players = Object.values(playersInfo).sort(
            (lhs, rhs) => lhs.players_order - rhs.players_order);
        console.log(players);

        let playerInfoContainer = htmlToNode(`<div class="game-player-info" style="height: 160px; flex-wrap: nowrap; left: 100%; position: static; margin-left: 20px; overflow-y: visible; width: auto;">`);
        removedUnitsPanel.appendChild(playerInfoContainer);

        let playerPanels = {};
        for (let playerInfo of players) {
            let playerPanel = new PlayerPanel(playerInfoContainer, playerInfo);
            playerPanels[playerInfo.countries_code] = playerPanel;
        }

        parser.addListener((mapEntities) => {
            let propertiesByCountry = {};
            for (let property of mapEntities.properties) {
                if (!propertiesByCountry.hasOwnProperty(property.country.code)) {
                    propertiesByCountry[property.country.code] = [];
                }
                propertiesByCountry[property.country.code].push(property);
            }
            let unitsByCountry = {};
            for (let unit of mapEntities.units) {
                if (!unitsByCountry.hasOwnProperty(unit.country.code)) {
                    unitsByCountry[unit.country.code] = [];
                }
                unitsByCountry[unit.country.code].push(unit);
            }

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
        // TODO: filter out cursor-only updates? they're useful for debugging
        throttler.handleUpdate();
    });
    observer.observe(gamemap, {subtree: true, childList: true, attributes: true});

    // Initial ping to grab state if there are no other events
    throttler.handleUpdate();
}

