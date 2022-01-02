const kMoveTileHtml = `
<span class="movement-tile" style="border-style: solid; border-width: 1px; pointer-events: none;"></span>
`;

const kAttackTileHtml = `
<span class="range-square check-range-square" style="border-style: solid; border-width: 1px; pointer-events: none;"></span>
`;


function getNeighbors(coord) {
    let positions = [
        {x: coord.x, y: coord.y - 1},
        {x: coord.x + 1, y: coord.y},
        {x: coord.x, y: coord.y + 1},
        {x: coord.x - 1, y: coord.y},
    ];

    return Object.fromEntries(positions.map((position) => [position.x + "," + position.y, position]));
}

function getIndirectAttackRange(coords, minRange, maxRange) {
    let positions = {};
    for (let xOffset = -maxRange; xOffset <= maxRange; xOffset++) {
        for (let yOffset = -maxRange; yOffset <= maxRange; yOffset++) {
            let totalOffset = Math.abs(xOffset) + Math.abs(yOffset);
            if (minRange <= totalOffset && totalOffset <= maxRange) {
                let position = {
                    x: coords.x + xOffset,
                    y: coords.y + yOffset,
                };
                let positionId = position.x + "," + position.y;
                positions[positionId] = position;
            }
        }
    }
    return positions;
}

class MoveRangePreview {
    constructor(gamemap, terrainInfo, players) {
        this.gamemap = gamemap;
        this.terrainInfo = terrainInfo;
        this.maxX = maxMajorDimension(terrainInfo);
        this.maxY = maxMinorDimension(terrainInfo);

        this.playersByCountry = toDict(players, (player) => player.countries_code);

        this.units = [];
        this.unitsByCoords = {};

        this.rangeTiles = [];
        this.displayingSelectedUnit = false;

        gamemap.addEventListener("click", this.onClick.bind(this));
        let menu = document.getElementById("options-menu");
        menu.addEventListener("click", this.onClick.bind(this));
    }

    onMapUpdate(mapEntities) {
        this.weather = mapEntities.weather;
        this.units = mapEntities.units;
        let unitsByCoords = {};
        for (let unit of mapEntities.units) {
            if (unitsByCoords[unit.coords.x] === undefined) {
                unitsByCoords[unit.coords.x] = [];
            }
            unitsByCoords[unit.coords.x][unit.coords.y] = unit;
        }
        this.unitsByCoords = unitsByCoords;
    }

    isInBounds(coord) {
        return coord.x >= 0 && coord.x < this.maxX
            && coord.y >= 0 && coord.y < this.maxY;
    }

    getUnitAt(coord) {
        return (this.unitsByCoords[coord.x] || {})[coord.y];
    }

    getTerrainAt(coord) {
        let terrainInfo = (this.terrainInfo[coord.x] || {})[coord.y];
        if (terrainInfo === undefined) {
            reportError("Missing terrain info at", coord, "(", this.terrainInfo, ")");
            return "properties";
        }
        let terrains = kTerrainById[terrainInfo.terrain_id];
        if (terrains === undefined || terrains.length < 1) {
            reportError("Failed to lookup terrain id:", terrainInfo.terrain_id);
            return "properties";
        } else if (terrains.length > 1) {
            reportError("Found more than one terrain with id:", terrainInfo.terrain_id);
        }
        return terrains[0];
    }

    isDamageCalculatorSelecting() {
        let selectAttacker = document.querySelector("#calculator .select-attacker");
        let selectDefender = document.querySelector("#calculator .select-defender");

        let selectingAttacker = selectAttacker?.style?.getPropertyValue("color") === "black";
        let selectingDefender = selectDefender?.style?.getPropertyValue("color") === "black";
        return selectingAttacker || selectingDefender;
    }

    onClick(event) {
        if (event.target.id === "move") {
            console.log("clicked move:", event);
        } else if (event.target.parentNode && event.target.parentNode.id.indexOf("unit_") !== -1) {
            // Ignore unit clicks that are for populating the damage calculator
            if (this.isDamageCalculatorSelecting()) {
                console.log("ignoring click because damage calculator is selecting");
                return;
            }
            console.log("clicked unit:", event);

            // TODO: what should this condition actually be?
            if (this.rangeTiles.length > 0 && this.displayingSelectedUnit) {
                this.clearMoveRange();
            } else {
                this.clearMoveRange();
                let unitSpan = event.target.parentNode;
                this.showMoveRangeFor(this.getUnitWithSpan(unitSpan), /*selected=*/true);
            }
        } else {
            console.log("clicked something else:", event);
            this.clearMoveRange();
        }
    }

    onCursorUpdate(cursorData) {
        if (this.displayingSelectedUnit) {
            return;
        }

        this.clearMoveRange();
        let infoUnit = cursorData.infoMode ? this.getUnitAt(cursorData.coords) : undefined;
        if (infoUnit) {
            if (cursorData.isQuickMoveRange) {
                this.showMoveRangeFor(infoUnit, /*selected=*/false);
            } else if (cursorData.isQuickAttackRange) {
                this.showAttackRangeFor(infoUnit, /*selected=*/false);
            }
        }
    }

    getUnitWithSpan(span) {
        for (let unit of this.units) {
            if (unit.element === span) {
                return unit;
            }
        }
        reportError("Failed to find unit with span:", span);
        return this.units[0];
    }

    showMoveRangeFor(unit, selected) {
        this.displayingSelectedUnit = selected;
        this.displayMoveRangeTiles(this.getPositionsInMoveRange(unit));
    }

    showAttackRangeFor(unit, selected) {
        this.displayingSelectedUnit = selected;
        this.displayAttackRangeTiles(this.getPositionsInAttackRange(unit));
    }

    getPositionsInMoveRange(unit) {
        let unitData = kUnitsByName[unit.unit];
        let playerInfo = this.playersByCountry[unit.country.code];
        let moveCostMatrix = lookupMoveCostMatrix(this.weather, playerInfo);
        let startingMove = lookupUnitMoveForCo(unitData, playerInfo);

        let startId = unit.coords.x + "," + unit.coords.y;
        let positions = {};
        positions[startId] = unit.coords;
        let visited = {};
        visited[startId] = startingMove;
        let queue = [{coord: unit.coords, remainingMove: startingMove}];
        let nextQueue = [];
        while (queue.length > 0) {
            for (let {coord, remainingMove} of queue) {
                let neighbors = getNeighbors(coord);
                for (let neighborId in neighbors) {
                    let neighbor = neighbors[neighborId];
                    if (!this.isInBounds(neighbor)) {
                        continue;
                    }

                    if (visited[neighborId] >= remainingMove) {
                        continue;
                    }
                    visited[neighborId] = remainingMove;

                    let unitAt = this.getUnitAt(neighbor);
                    // TODO: handle teams correctly?
                    if (unitAt && unitAt.country.code !== unit.country.code) {
                        continue;
                    }
                    let terrain = this.getTerrainAt(neighbor);
                    let terrainCost = moveCostMatrix[terrain][unitData.move_type];
                    if (terrainCost === 0 || terrainCost > remainingMove) {
                        continue;
                    }

                    let newRemainingMove = remainingMove - terrainCost;
                    positions[neighborId] = neighbor;
                    nextQueue.push({coord: neighbor, remainingMove: newRemainingMove});
                }
            }
            queue = nextQueue;
            nextQueue = [];
        }

        return positions;
    }

    getPositionsInAttackRange(unit) {
        let unitData = kUnitsByName[unit.unit];
        let playerInfo = this.playersByCountry[unit.country.code];
        let [minRange, maxRange] = lookupUnitAttackRangeForCo(unitData, playerInfo);

        if (minRange > 1) {
            return getIndirectAttackRange(unit.coords, minRange, maxRange);
        } else if (minRange === 0) {
            return {};
        }

        let attackPositions = {};
        let visited = {};
        let movePositions = this.getPositionsInMoveRange(unit);
        for (let positionId in movePositions) {
            let position = movePositions[positionId];

            // TODO: should it show attacks from occupied squares?
            // TODO: should it show attacks onto units that it can't damage?
            let neighbors = getNeighbors(position);
            for (let neighborId in neighbors) {
                if (neighborId in visited) {
                    continue;
                }
                let neighbor = neighbors[neighborId];

                visited[neighborId] = true;
                attackPositions[neighborId] = neighbor;
            }
        }
        return attackPositions;
    }

    // TODO: add special highlighting for the position we started from
    displayMoveRangeTiles(positions) {
        this.displayRangeTiles(positions, kMoveTileHtml);
    }

    displayAttackRangeTiles(positions) {
        this.displayRangeTiles(positions, kAttackTileHtml);
    }

    displayRangeTiles(positions, tileHtml) {
        for (let positionId in positions) {
            let position = positions[positionId];
            if (!this.isInBounds(position)) {
                continue;
            }

            let tile = htmlToNode(tileHtml);
            this.rangeTiles.push(tile);

            let neighbors = getNeighbors(position);
            let borderWidths = [];
            for (let direction in neighbors) {
                let neighbor = neighbors[direction];
                let neighborId = neighbor.x + "," + neighbor.y;
                if (!(neighborId in positions) && this.isInBounds(neighbor)) {
                    borderWidths.push("1px");
                } else {
                    borderWidths.push("0px");
                }
            }
            tile.style.setProperty("border-width", borderWidths.join(" "));

            let leftOffset = position.x * 16;
            let topOffset = position.y * 16;
            tile.style.setProperty("left", leftOffset + "px");
            tile.style.setProperty("top", topOffset + "px");
            this.gamemap.appendChild(tile);
        }
    }

    clearMoveRange() {
        for (let rangeTile of this.rangeTiles) {
            rangeTile.remove();
        }
        this.rangeTiles = [];
        this.displayingSelectedUnit = false;
    }
}
