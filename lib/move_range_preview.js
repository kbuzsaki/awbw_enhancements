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
    constructor(gamemap, terrainInfo) {
        this.gamemap = gamemap;
        this.terrainInfo = terrainInfo;
        // TODO: this is broken if the edge of the map is full of properties, need to merge with buildings
        this.maxX = maxMajorDimension(terrainInfo);
        this.maxY = maxMinorDimension(terrainInfo);

        this.units = [];
        this.unitsByCoords = {};

        this.lastClickedUnitId = undefined;
        this.rangeTiles = [];

        gamemap.addEventListener("click", this.onClick.bind(this));
        let menu = document.getElementById("options-menu");
        menu.addEventListener("click", this.onClick.bind(this));
    }

    onMapUpdate(mapEntities) {
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
        // TODO: handle buildings
        let terrainInfo = (this.terrainInfo[coord.x] || {})[coord.y];
        if (terrainInfo === undefined) {
            return "urban";
        }
        return kTerrainById[terrainInfo.terrain_id][0];
    }

    onClick(event) {
        if (event.target.id === "move") {
            console.log("clicked move:", event);
        } else if (event.target.parentNode && event.target.parentNode.id.indexOf("unit_") !== -1) {
            // TODO: ignore clicks from damage calculator selection
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

    // TODO: handle CO unit move boosts
    // TODO: handle weather
    // TODO: handle holes in terrainInfo (from buildingInfo) properly
    getPositionsInRange(unit) {
        let unitData = kUnitsByName[unit.unit];

        let startId = unit.coords.x + "," + unit.coords.y;
        let positions = {};
        positions[startId] = unit.coords;
        let visited = {};
        visited[startId] = unitData.move;
        let queue = [{coord: unit.coords, remainingMove: unitData.move}];
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
                    let terrainCost = kMoveCostByTerrain[terrain][unitData.move_type];
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

    // TODO: fix edge display
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
