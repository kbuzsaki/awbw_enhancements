const kCountries = [
    {code: "os", flatName: "orangestar"},
    {code: "bm", flatName: "bluemoon"},
    {code: "ge", flatName: "greenearth"},
    {code: "yc", flatName: "yellowcomet"},
    {code: "bh", flatName: "blackhole"},
    {code: "rf", flatName: "redfire"},
    {code: "gs", flatName: "greysky"},
    {code: "bd", flatName: "browndesert"},
    {code: "ab", flatName: "amberblaze"},
    {code: "js", flatName: "jadesun"},
    {code: "ci", flatName: "cobaltice"},
    {code: "pc", flatName: "pinkcosmos"},
    {code: "tg", flatName: "tealgalaxy"},
    {code: "pl", flatName: "purplelightning"},
    {code: "ar", flatName: "acidrain"},
    {code: "wn", flatName: "whitenova"},
    {code: "??", flatName: "neutral"},
];

function parseIdFromResourceUrl(url) {
    return url.split("/").at(-1).split(".").at(0);
}

function parseCountryFromId(id) {
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

    handleMapUpdate() {
        let mapEntities = this.parseMapEntities();
        console.log("map entities:", mapEntities);
    }
}


let gamemap = document.getElementById("gamemap");
if (gamemap !== undefined) {
    let parser = new GameStateParser(gamemap);
    parser.handleMapUpdate();

    let throttler = new UpdateThrottler(kDefaultThrottleMs, () => {
        parser.handleMapUpdate();
    });
    let observer = new MutationObserver((mutations, observer) => {
        // TODO: filter out cursor-only updates? they're useful for debugging
        throttler.handleUpdate();
    });
    observer.observe(gamemap, {subtree: true, childList: true, attributes: true});
}

