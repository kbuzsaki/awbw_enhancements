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
    // Special "property" tiles don't have a country
    if (kSpecialNeutralTiles.indexOf(id) !== -1) {
        let country = kCountries[0];
        let remainder = id;
        return {country, remainder};
    }

    // Waited units have the "gs_" prefix on their images?
    if (id.startsWith("gs_")) {
        id = id.substr(3);
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

    unitData() {
        return kUnitsByName[this.unit];
    }

    unitValue() {
        // TODO: handle unit value for colin / kanbei / hachi
        return this.unitData().cost * (parseInt(this.hp) / 10);
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
