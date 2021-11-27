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

const kUnitData = [
  {name: "anti-air",   cost: 8000},
  {name: "apc",        cost: 5000},
  {name: "artillery",  cost: 6000},
  {name: "b-copter",   cost: 9000},
  {name: "battleship", cost: 28000},
  {name: "blackboat",  cost: 7500},
  {name: "blackbomb",  cost: 25000},
  {name: "bomber",     cost: 22000},
  {name: "carrier",    cost: 30000},
  {name: "cruiser",    cost: 18000},
  {name: "fighter",    cost: 20000},
  {name: "infantry",   cost: 1000},
  {name: "lander",     cost: 12000},
  {name: "md",         cost: 16000},
  {name: "mech",       cost: 3000},
  {name: "megatank",   cost: 28000},
  {name: "missile",    cost: 12000},
  {name: "neotank",    cost: 22000},
  {name: "piperunner", cost: 20000},
  {name: "recon",      cost: 4000},
  {name: "rocket",     cost: 15000},
  {name: "stealth",    cost: 24000},
  {name: "sub",        cost: 20000},
  {name: "t-copter",   cost: 5000},
  {name: "tank",       cost: 7000},
];
const kUnitsByName = toDict(kUnitData, (unit) => unit.name);

// TODO: allow user specified default funding level?
const kDefaultFundingLevel = 1000;
