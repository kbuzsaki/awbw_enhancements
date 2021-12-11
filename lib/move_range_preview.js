const kMoveTileHtml = `
<span class="movement-tile" style="border-style: solid; border-width: 1px;"></span>
`;


function getNeighbors(coord) {
    return {
        top:    {x: coord.x, y: coord.y - 1},
        right:  {x: coord.x + 1, y: coord.y},
        bottom: {x: coord.x, y: coord.y + 1},
        left:   {x: coord.x - 1, y: coord.y},
    };
}

class MoveRangePreview {
    constructor(gamemap, terrainInfo, buildingsInfo, players) {
        this.gamemap = gamemap;
        this.rawTerrainInfo = terrainInfo;
        this.rawBuildingsInfo = buildingsInfo;
        this.terrainInfo = mergeMatrices(terrainInfo, buildingsInfo);
        this.maxX = maxMajorDimension(terrainInfo);
        this.maxY = maxMinorDimension(terrainInfo);

        this.playersByCountry = toDict(players, (player) => player.countries_code);

        this.units = [];
        this.unitsByCoords = {};

        this.lastClickedUnitId = undefined;
        this.rangeTiles = [];

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
            return "properties";
        }
        return kTerrainById[terrainInfo.terrain_id][0];
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

            let clickedUnitId = event.target.parentNode.id.split("_")[1];
            if (this.lastClickedUnitId !== undefined) {
                this.clearMoveRange();
            } else {
                this.lastClickedUnitId = clickedUnitId;
                this.updateMoveRange();
            }
        } else {
            console.log("clicked something else:", event);
            this.clearMoveRange();
        }
    }

    updateMoveRange() {
        let selectedUnit;
        for (let unit of this.units) {
            if (unit.id === this.lastClickedUnitId) {
                selectedUnit = unit;
                break;
            }
        }

        if (selectedUnit) {
            this.displayMoveRangeTiles(this.getPositionsInRange(selectedUnit));
        }
    }

    getPositionsInRange(unit) {
        let unitData = kUnitsByName[unit.unit];
        let coName = this.playersByCountry[unit.country.code].co_name;
        let moveCostMatrix = lookupMoveCostMatrix(this.weather, coName);
        let startingMove = lookupUnitMoveForCo(unitData, coName);

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
                for (let neighbor of Object.values(neighbors)) {
                    let coordId = neighbor.x + "," + neighbor.y;
                    if (visited[coordId] >= remainingMove) {
                        continue;
                    }
                    visited[coordId] = remainingMove;

                    let unitAt = this.getUnitAt(neighbor);
                    if (unitAt && unitAt.country.code !== unit.country.code) {
                        continue;
                    }
                    let terrain = this.getTerrainAt(neighbor);
                    let terrainCost = moveCostMatrix[terrain][unitData.move_type];
                    if (terrainCost === 0 || terrainCost > remainingMove) {
                        continue;
                    }

                    let newRemainingMove = remainingMove - terrainCost;
                    positions[coordId] = neighbor;
                    nextQueue.push({coord: neighbor, remainingMove: newRemainingMove});
                }
            }
            queue = nextQueue;
            nextQueue = [];
        }

        return positions;
    }

    displayMoveRangeTiles(positions) {
        for (let positionId in positions) {
            let position = positions[positionId];
            if (!this.isInBounds(position)) {
                continue;
            }

            let tile = htmlToNode(kMoveTileHtml);
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
        this.lastClickedUnitId = undefined;
    }
}
