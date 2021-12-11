function parseIdFromResourceUrl(url) {
    let filename = url.split("/").at(-1);
    let filenameWithoutExtension = filename.substring(0, filename.lastIndexOf("."));
    let decoded = decodeURIComponent(filenameWithoutExtension);
    return decoded.replace(" ", "");
}

const kSpecialNeutralTiles = [
  "missilesilo",
  "missilesiloempty",
  "hpiperubble",
  "hpipeseam",
  "vpiperubble",
  "vpipeseam",
  "hpipe",
  "vpipe",
  "epipeend",
  "npipeend",
  "spipeend",
  "wpipeend",
];
function parseCountryFromId(id) {
    // Waited units have the "gs_" prefix on their images?
    let is_waited = false;
    if (id.startsWith("gs_")) {
        is_waited = true;
        id = id.substr(3);
    }

    if (id.endsWith("_snow")) {
        id = id.substr(0, id.length - 5);
    }
    if (id.endsWith("_rain")) {
        id = id.substr(0, id.length - 5);
    }

    // Special "property" tiles don't have a country
    if (kSpecialNeutralTiles.indexOf(id) !== -1) {
        let country = kCountries[0];
        let remainder = id;
        return {is_waited, country, remainder};
    }

    for (let country of kCountries) {
        if (id.startsWith(country.code)) {
            let remainder = id.substr(country.code.length);
            return {is_waited, country, remainder};
        } else if (id.startsWith(country.flatName)) {
            let remainder = id.substr(country.flatName.length);
            return {is_waited, country, remainder};
        }
    }
    throw "Failed to parse country from id: '" + id + "'";
}

function parseEntityImages(element) {
    let images = element.getElementsByTagName("img");
    let srcs = [];
    for (let image of images) {
        srcs.push(image.src);
    }
    return srcs;
}

function parseCoordinatesFromUnitSpan(span) {
    if (span.style.top && span.style.left) {
        let top_offset = span.style.top.substr(0, span.style.top.length - 2);
        let left_offset = span.style.left.substr(0, span.style.left.length - 2);

        return {x: parseInt(left_offset) / 16, y: parseInt(top_offset) / 16};
    }
}

class Property {
    // TODO: stop holding a reference to the actual element here and in Unit
    constructor(element, country, tile) {
        this.element = element;
        this.country = country;
        this.tile = tile;
    }

    // TODO: get coordinates
    static fromElement(element) {
        let srcs = parseEntityImages(element);

        let id = parseIdFromResourceUrl(srcs[0]);
        let {country, remainder} = parseCountryFromId(id);
        return new Property(element, country, remainder);
    }

    producesIncome() {
        return ["hq", "city", "base", "airport", "port"].indexOf(this.tile) !== -1;
    }
}

class Unit {
    constructor(element, country, unit, coords, hp, is_waited, others) {
        this.id = element.id.split("_")[1];
        this.element = element;
        this.country = country;
        this.coords = coords;
        this.unit = unit;
        this.is_waited = is_waited;
        this.hp = hp;
        this.others = others;
        this.is_capture = false;
        for (let other of others) {
            if (other === "capture" || other === "gs_capture") {
                this.is_capture = true;
            }
        }
    }

    static fromElement(element) {
        let srcs = parseEntityImages(element);

        // Patch broken black boat sprite
        if (true /* TODO: add option */) {
            let imgs = element.getElementsByTagName("img");
            for (let img of imgs) {
                if (img.src.indexOf("%20") !== -1) {
                    console.log("Patching suspected broken img url:", img.src);
                    img.src = img.src.replace("%20", "");
                }
            }
        }

        // assume that the first src is the unit itself
        let id = parseIdFromResourceUrl(srcs[0]);
        let {is_waited, country, remainder} = parseCountryFromId(id);

        let coords = parseCoordinatesFromUnitSpan(element);

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

        return new Unit(element, country, remainder, coords, hp, is_waited, others);
    }

    unitData() {
        return kUnitsByName[this.unit];
    }

    unitValue() {
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

        let mapEntities = {
            properties: [],
            units: [],
            weather: kWeatherClear,
        };

        let mapImage = document.getElementById("map-background");
        if (mapImage) {
            let mapId = parseIdFromResourceUrl(mapImage.src);
            if (mapId.startsWith("R")) {
                mapEntities.weather = kWeatherRain;
            } else if (mapId.startsWith("S")) {
                mapEntities.weather = kWeatherSnow;
            }
        }

        let dynamicElements = this.gamemap.getElementsByTagName("span");
        for (let element of dynamicElements) {
            if (isPropertyElement(element)) {
                mapEntities.properties.push(Property.fromElement(element));
            } else if (isUnitElement(element)) {
                mapEntities.units.push(Unit.fromElement(element));
            }
        }

        return mapEntities;
    }
}
