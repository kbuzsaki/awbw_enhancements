const kCountries = [
    {turnOrder: 0,  code: "??", flatName: "neutral",         name: "Neutral"},
    {turnOrder: 1,  code: "os", flatName: "orangestar",      name: "Orange Star"},
    {turnOrder: 2,  code: "bm", flatName: "bluemoon",        name: "Blue Moon"},
    {turnOrder: 3,  code: "ge", flatName: "greenearth",      name: "Green Earth"},
    {turnOrder: 4,  code: "yc", flatName: "yellowcomet",     name: "Yellow Comet"},
    {turnOrder: 5,  code: "bh", flatName: "blackhole",       name: "Black Hole"},
    {turnOrder: 6,  code: "rf", flatName: "redfire",         name: "Red Fire"},
    {turnOrder: 7,  code: "gs", flatName: "greysky",         name: "Grey Sky"},
    {turnOrder: 8,  code: "bd", flatName: "browndesert",     name: "Brown Desert"},
    {turnOrder: 9,  code: "ab", flatName: "amberblaze",      name: "Amber Blaze"},
    {turnOrder: 10, code: "js", flatName: "jadesun",         name: "Jade Sun"},
    {turnOrder: 11, code: "ci", flatName: "cobaltice",       name: "Cobolt Ice"},
    {turnOrder: 12, code: "pc", flatName: "pinkcosmos",      name: "Pink Cosmos"},
    {turnOrder: 13, code: "tg", flatName: "tealgalaxy",      name: "Teal Galaxy"},
    {turnOrder: 14, code: "pl", flatName: "purplelightning", name: "Purple Lightning"},
    {turnOrder: 15, code: "ar", flatName: "acidrain",        name: "Acid Rain"},
    {turnOrder: 16, code: "wn", flatName: "whitenova",       name: "White Nova"},
];
const kCountriesByCode = toDict(kCountries, (country) => country.code);

// Fields:
// - `name` is the name used in image filenames
// - `menuName`  is the name used in the build menu
// - `cost` is the unit's default cost
const kUnitData = [
  {name: "anti-air",   menuName: "Anti-Air",   cost: 8000,  move: 6, move_type: "T", facility: "base"},
  {name: "apc",        menuName: "APC",        cost: 5000,  move: 6, move_type: "T", facility: "base"},
  {name: "artillery",  menuName: "Artillery",  cost: 6000,  move: 5, move_type: "T", facility: "base"},
  {name: "b-copter",   menuName: "B-Copter",   cost: 9000,  move: 6, move_type: "A", facility: "airport"},
  {name: "battleship", menuName: "Battleship", cost: 28000, move: 5, move_type: "S", facility: "port"},
  {name: "blackboat",  menuName: "Black Boat", cost: 7500,  move: 7, move_type: "L", facility: "port"},
  {name: "blackbomb",  menuName: "Black Bomb", cost: 25000, move: 9, move_type: "A", facility: "airport"},
  {name: "bomber",     menuName: "Bomber",     cost: 22000, move: 7, move_type: "A", facility: "airport"},
  {name: "carrier",    menuName: "Carrier",    cost: 30000, move: 5, move_type: "S", facility: "port"},
  {name: "cruiser",    menuName: "Cruiser",    cost: 18000, move: 6, move_type: "S", facility: "port"},
  {name: "fighter",    menuName: "Fighter",    cost: 20000, move: 9, move_type: "A", facility: "airport"},
  {name: "infantry",   menuName: "Infantry",   cost: 1000,  move: 3, move_type: "F", facility: "base"},
  {name: "lander",     menuName: "Lander",     cost: 12000, move: 6, move_type: "L", facility: "port"},
  {name: "md.tank",    menuName: "Md.Tank",    cost: 16000, move: 5, move_type: "T", facility: "base"},
  {name: "mech",       menuName: "Mech",       cost: 3000,  move: 2, move_type: "B", facility: "base"},
  {name: "megatank",   menuName: "Mega Tank",  cost: 28000, move: 4, move_type: "T", facility: "base"},
  {name: "missile",    menuName: "Missile",    cost: 12000, move: 4, move_type: "W", facility: "base"},
  {name: "neotank",    menuName: "Neotank",    cost: 22000, move: 6, move_type: "T", facility: "base"},
  {name: "piperunner", menuName: "Piperunner", cost: 20000, move: 9, move_type: "P", facility: "base"},
  {name: "recon",      menuName: "Recon",      cost: 4000,  move: 8, move_type: "W", facility: "base"},
  {name: "rocket",     menuName: "Rocket",     cost: 15000, move: 5, move_type: "W", facility: "base"},
  {name: "stealth",    menuName: "Stealth",    cost: 24000, move: 6, move_type: "A", facility: "airport"},
  {name: "sub",        menuName: "Sub",        cost: 20000, move: 5, move_type: "S", facility: "port"},
  {name: "t-copter",   menuName: "T-Copter",   cost: 5000,  move: 6, move_type: "A", facility: "airport"},
  {name: "tank",       menuName: "Tank",       cost: 7000,  move: 6, move_type: "T", facility: "base"},
];
const kUnitsByName = toDict(kUnitData, (unit) => unit.name);
const kUnitsByMenuName = toDict(kUnitData, (unit) => unit.menuName);

// Supports +1 movement bonuses for particular COs
// TODO: support movement boosts from powers
function lookupUnitMoveForCo(unitData, coName) {
    if (coName === "Sami") {
        if (["apc", "t-copter", "lander", "blackboat"].includes(unitData.name)) {
            return unitData.move + 1;
        }
    } else if (coName === "Drake") {
        if (["S", "L"].includes(unitData.move_type)) {
            return unitData.move + 1;
        }
    } else if (coName === "Sensei") {
        if (["apc", "t-copter", "lander", "blackboat"].includes(unitData.name)) {
            return unitData.move + 1;
        }
    }
    return unitData.move;
}

// I'm pretty sure this is the AWBW order, but not cart order?
const kFacilityOrder = {"base": 1, "airport": 2, "port": 3};
const kUnitNamesInMenuOrder = Object.keys(kUnitsByName).sort((lhs, rhs) => {
    let lhsUnit = kUnitsByName[lhs];
    let rhsUnit = kUnitsByName[rhs];
    if (lhsUnit.facility !== rhsUnit.facility) {
        return kFacilityOrder[lhsUnit.facility] - kFacilityOrder[rhsUnit.facility];
    }
    return lhsUnit.cost - rhsUnit.cost;
});

function lookupUnitDataByBuildMenuName(buildMenuName) {
  return kUnitsByMenuName[buildMenuName];
}

function makeRange(start, end, step) {
    if (step === undefined) {
        step = 1;
    }

    let ls = [];
    for (let i = start; i < end; i++) {
        ls.push(i);
    }
    return ls;
}

// TODO: bridges
const kTerrainIds = {
    "plains":     [1, 115, 116],
    "mountain":   [2],
    "woods":      [3],
    "river":      makeRange(4, 15),
    "road":       makeRange(15, 28),
    "sea":        [28],
    "shoal":      makeRange(29, 33),
    "reef":       [33],
    "pipe":       makeRange(101, 111).concat([113, 114]),
    "base":       [35, 39, 44, 49, 54, 82, 87, 92, 97, 118, 123, 150, 157, 164, 171, 182, 189],
    "port":       [37, 41, 46, 51, 56, 84, 89, 94, 99, 121, 126, 155, 162, 169, 176, 187, 194],
    "silo":       [111, 112],
    // non-base, non-port properties
    "properties": [34, 36, 38, 40, 42, 43, 45, 47, 48, 50, 52, 53, 55, 57, 81, 83, 85, 86, 88,
                   90, 91, 93, 95, 96, 98, 100, 117, 119, 120, 122, 124, 125, 127, 128, 129,
                   130, 131, 132, 133, 134, 135, 136, 137, 138, 139, 140, 141, 142, 143, 144,
                   145, 146, 147, 148, 149, 151, 152, 153, 154, 156, 158, 159, 160, 161, 163,
                   165, 166, 167, 168, 170, 172, 173, 174, 175, 181, 183, 184, 185, 186, 188,
                   190, 191, 192, 193]
};
const kTerrainById = invertDict(kTerrainIds);

const kWeatherClear = "clear";
const kWeatherRain =  "rain";
const kWeatherSnow =  "snow";

const kMoveCostByTerrainClear = {
    "plains":     {F: 1, B: 1, T: 1, W: 2, A: 1, P: 0, S: 0, L: 0},
    "mountain":   {F: 2, B: 1, T: 0, W: 0, A: 1, P: 0, S: 0, L: 0},
    "woods":      {F: 1, B: 1, T: 2, W: 3, A: 1, P: 0, S: 0, L: 0},
    "river":      {F: 2, B: 1, T: 0, W: 0, A: 1, P: 0, S: 0, L: 0},
    "road":       {F: 1, B: 1, T: 1, W: 1, A: 1, P: 0, S: 0, L: 0},
    "sea":        {F: 0, B: 0, T: 0, W: 0, A: 1, P: 0, S: 1, L: 1},
    "shoal":      {F: 1, B: 1, T: 1, W: 1, A: 1, P: 0, S: 0, L: 1},
    "reef":       {F: 0, B: 0, T: 0, W: 0, A: 1, P: 0, S: 2, L: 2},
    "pipe":       {F: 0, B: 0, T: 0, W: 0, A: 0, P: 1, S: 0, L: 0},
    "base":       {F: 1, B: 1, T: 1, W: 1, A: 1, P: 1, S: 0, L: 0},
    "port":       {F: 1, B: 1, T: 1, W: 1, A: 1, P: 0, S: 1, L: 1},
    "silo":       {F: 1, B: 1, T: 1, W: 1, A: 1, P: 0, S: 0, L: 0},
    "properties": {F: 1, B: 1, T: 1, W: 1, A: 1, P: 0, S: 0, L: 0},
};

const kMoveCostByTerrainRain = {
    "plains":     {F: 1, B: 1, T: 2, W: 3, A: 1, P: 0, S: 0, L: 0},
    "mountain":   {F: 2, B: 1, T: 0, W: 0, A: 1, P: 0, S: 0, L: 0},
    "woods":      {F: 1, B: 1, T: 3, W: 4, A: 1, P: 0, S: 0, L: 0},
    "river":      {F: 2, B: 1, T: 0, W: 0, A: 1, P: 0, S: 0, L: 0},
    "road":       {F: 1, B: 1, T: 1, W: 1, A: 1, P: 0, S: 0, L: 0},
    "sea":        {F: 0, B: 0, T: 0, W: 0, A: 1, P: 0, S: 1, L: 1},
    "shoal":      {F: 1, B: 1, T: 1, W: 1, A: 1, P: 0, S: 0, L: 1},
    "reef":       {F: 0, B: 0, T: 0, W: 0, A: 1, P: 0, S: 2, L: 2},
    "pipe":       {F: 0, B: 0, T: 0, W: 0, A: 0, P: 1, S: 0, L: 0},
    "base":       {F: 1, B: 1, T: 1, W: 1, A: 1, P: 1, S: 0, L: 0},
    "port":       {F: 1, B: 1, T: 1, W: 1, A: 1, P: 0, S: 1, L: 1},
    "silo":       {F: 1, B: 1, T: 1, W: 1, A: 1, P: 0, S: 0, L: 0},
    "properties": {F: 1, B: 1, T: 1, W: 1, A: 1, P: 0, S: 0, L: 0},
};

const kMoveCostByTerrainSnow = {
    "plains":     {F: 2, B: 1, T: 2, W: 3, A: 2, P: 0, S: 0, L: 0},
    "mountain":   {F: 4, B: 2, T: 0, W: 0, A: 2, P: 0, S: 0, L: 0},
    "woods":      {F: 2, B: 1, T: 2, W: 3, A: 2, P: 0, S: 0, L: 0},
    "river":      {F: 2, B: 1, T: 0, W: 0, A: 2, P: 0, S: 0, L: 0},
    "road":       {F: 1, B: 1, T: 1, W: 1, A: 2, P: 0, S: 0, L: 0},
    "sea":        {F: 0, B: 0, T: 0, W: 0, A: 2, P: 0, S: 2, L: 2},
    "shoal":      {F: 1, B: 1, T: 1, W: 1, A: 2, P: 0, S: 0, L: 1},
    "reef":       {F: 0, B: 0, T: 0, W: 0, A: 2, P: 0, S: 2, L: 2},
    "pipe":       {F: 0, B: 0, T: 0, W: 0, A: 0, P: 1, S: 0, L: 0},
    "base":       {F: 1, B: 1, T: 1, W: 1, A: 2, P: 1, S: 0, L: 0},
    "port":       {F: 1, B: 1, T: 1, W: 1, A: 2, P: 0, S: 2, L: 2},
    "silo":       {F: 1, B: 1, T: 1, W: 1, A: 2, P: 0, S: 0, L: 0},
    "properties": {F: 1, B: 1, T: 1, W: 1, A: 2, P: 0, S: 0, L: 0},
};

const kMoveCostByTerrainSturm = {
    "plains":     {F: 1, B: 1, T: 1, W: 1, A: 1, P: 0, S: 0, L: 0},
    "mountain":   {F: 1, B: 1, T: 0, W: 0, A: 1, P: 0, S: 0, L: 0},
    "woods":      {F: 1, B: 1, T: 1, W: 1, A: 1, P: 0, S: 0, L: 0},
    "river":      {F: 1, B: 1, T: 0, W: 0, A: 1, P: 0, S: 0, L: 0},
    "road":       {F: 1, B: 1, T: 1, W: 1, A: 1, P: 0, S: 0, L: 0},
    "sea":        {F: 0, B: 0, T: 0, W: 0, A: 1, P: 0, S: 1, L: 1},
    "shoal":      {F: 1, B: 1, T: 1, W: 1, A: 1, P: 0, S: 0, L: 1},
    "reef":       {F: 0, B: 0, T: 0, W: 0, A: 1, P: 0, S: 1, L: 1},
    "pipe":       {F: 0, B: 0, T: 0, W: 0, A: 0, P: 1, S: 0, L: 0},
    "base":       {F: 1, B: 1, T: 1, W: 1, A: 1, P: 1, S: 0, L: 0},
    "port":       {F: 1, B: 1, T: 1, W: 1, A: 1, P: 0, S: 1, L: 1},
    "silo":       {F: 1, B: 1, T: 1, W: 1, A: 1, P: 0, S: 0, L: 0},
    "properties": {F: 1, B: 1, T: 1, W: 1, A: 1, P: 0, S: 0, L: 0},
};

// TODO: support lash powers
function lookupMoveCostMatrix(weather, coName) {
    if (coName === "Sturm" && weather !== kWeatherSnow) {
        return kMoveCostByTerrainSturm;
    }

    if (weather === kWeatherClear) {
        return kMoveCostByTerrainClear;
    }

    if (weather === kWeatherSnow) {
        if (coName === "Olaf") {
            return kMoveCostByTerrainClear;
        }
        return kMoveCostByTerrainSnow;
    }
    if (weather === kWeatherRain) {
        if (coName === "Olaf") {
            return kMoveCostByTerrainSnow;
        } else if (coName === "Drake") {
            return kMoveCostByTerrainClear;
        }
        return kMoveCostByTerrainRain;
    }

    console.log("Unrecognized weather:", weather);
    return kMoveCostByTerrainClear;
}
