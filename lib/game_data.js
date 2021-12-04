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
  {name: "anti-air",   menuName: "Anti-Air",   cost: 8000,  facility: "base"},
  {name: "apc",        menuName: "APC",        cost: 5000,  facility: "base"},
  {name: "artillery",  menuName: "Artillery",  cost: 6000,  facility: "base"},
  {name: "b-copter",   menuName: "B-Copter",   cost: 9000,  facility: "airport"},
  {name: "battleship", menuName: "Battleship", cost: 28000, facility: "port"},
  {name: "blackboat",  menuName: "Black Boat", cost: 7500,  facility: "port"},
  {name: "blackbomb",  menuName: "Black Bomb", cost: 25000, facility: "airport"},
  {name: "bomber",     menuName: "Bomber",     cost: 22000, facility: "airport"},
  {name: "carrier",    menuName: "Carrier",    cost: 30000, facility: "port"},
  {name: "cruiser",    menuName: "Cruiser",    cost: 18000, facility: "port"},
  {name: "fighter",    menuName: "Fighter",    cost: 20000, facility: "airport"},
  {name: "infantry",   menuName: "Infantry",   cost: 1000,  facility: "base"},
  {name: "lander",     menuName: "Lander",     cost: 12000, facility: "port"},
  {name: "md",         menuName: "Md.Tank",    cost: 16000, facility: "base"},
  {name: "mech",       menuName: "Mech",       cost: 3000,  facility: "base"},
  {name: "megatank",   menuName: "Mega Tank",  cost: 28000, facility: "base"},
  {name: "missile",    menuName: "Missile",    cost: 12000, facility: "base"},
  {name: "neotank",    menuName: "Neotank",    cost: 22000, facility: "base"},
  {name: "piperunner", menuName: "Piperunner", cost: 20000, facility: "base"},
  {name: "recon",      menuName: "Recon",      cost: 4000,  facility: "base"},
  {name: "rocket",     menuName: "Rocket",     cost: 15000, facility: "base"},
  {name: "stealth",    menuName: "Stealth",    cost: 24000, facility: "airport"},
  {name: "sub",        menuName: "Sub",        cost: 20000, facility: "port"},
  {name: "t-copter",   menuName: "T-Copter",   cost: 5000,  facility: "airport"},
  {name: "tank",       menuName: "Tank",       cost: 7000,  facility: "base"},
];
const kUnitsByName = toDict(kUnitData, (unit) => unit.name);
const kUnitsByMenuName = toDict(kUnitData, (unit) => unit.menuName);

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

// TODO: allow user specified default funding level?
const kDefaultFundingLevel = 1000;
