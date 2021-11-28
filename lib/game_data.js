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
  {name: "anti-air",   menuName: "Anti-Air",   cost: 8000},
  {name: "apc",        menuName: "APC",        cost: 5000},
  {name: "artillery",  menuName: "Artillery",  cost: 6000},
  {name: "b-copter",   menuName: "B-Copter",   cost: 9000},
  {name: "battleship", menuName: "Battleship", cost: 28000},
  {name: "blackboat",  menuName: "Black Boat", cost: 7500},
  {name: "blackbomb",  menuName: "Black Bomb", cost: 25000},
  {name: "bomber",     menuName: "Bomber",     cost: 22000},
  {name: "carrier",    menuName: "Carrier",    cost: 30000},
  {name: "cruiser",    menuName: "Cruiser",    cost: 18000},
  {name: "fighter",    menuName: "Fighter",    cost: 20000},
  {name: "infantry",   menuName: "Infantry",   cost: 1000},
  {name: "lander",     menuName: "Lander",     cost: 12000},
  {name: "md",         menuName: "Md.Tank",    cost: 16000},
  {name: "mech",       menuName: "Mech",       cost: 3000},
  {name: "megatank",   menuName: "Mega Tank",  cost: 28000},
  {name: "missile",    menuName: "Missile",    cost: 12000},
  {name: "neotank",    menuName: "Neotank",    cost: 22000},
  {name: "piperunner", menuName: "Piperunner", cost: 20000},
  {name: "recon",      menuName: "Recon",      cost: 4000},
  {name: "rocket",     menuName: "Rocket",     cost: 15000},
  {name: "stealth",    menuName: "Stealth",    cost: 24000},
  {name: "sub",        menuName: "Sub",        cost: 20000},
  {name: "t-copter",   menuName: "T-Copter",   cost: 5000},
  {name: "tank",       menuName: "Tank",       cost: 7000},
];
const kUnitsByName = toDict(kUnitData, (unit) => unit.name);
const kUnitsByMenuName = toDict(kUnitData, (unit) => unit.menuName);

function lookupUnitDataByBuildMenuName(buildMenuName) {
  return kUnitsByMenuName[buildMenuName];
}

// TODO: allow user specified default funding level?
const kDefaultFundingLevel = 1000;
