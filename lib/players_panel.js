const kPlayerInfoPanelHtml = `<div class="game-player-info" style="height: 160px; flex-wrap: nowrap; left: 100%; position: static; margin-left: 20px; overflow-y: visible; width: auto;">`;

class PlayersPanel {
    constructor(parentNode, players) {
        this.parentNode = parentNode;
        this.players = players;

        this.playerInfoContainer = htmlToNode(kPlayerInfoPanelHtml);
        this.parentNode.appendChild(this.playerInfoContainer);

        this.playerPanels = {};
        for (let i = 0; i < this.players.length; i++) {
            let playerInfo = this.players[i];
            let playerPanel = new PlayerPanel(this.playerInfoContainer, playerInfo, () => {
                this.handleTurnEndedFor(i);
            });
            this.playerPanels[playerInfo.countries_code] = playerPanel;
        }
    }

    handleTurnEndedFor(endedIndex) {
        // TODO: add a day counter?
        let nextIndex = (endedIndex + 1) % this.players.length;

        let endedPlayer = this.players[endedIndex];
        let endedPanel = this.playerPanels[endedPlayer.countries_code];
        endedPanel.endTurn();
        document.getElementById(endedPlayer.countries_code + "-logo").click();
        document.getElementById("unwait-all").click();

        let nextPlayer = this.players[nextIndex];
        let nextPanel = this.playerPanels[nextPlayer.countries_code];
        nextPanel.startTurn();
        document.getElementById(nextPlayer.countries_code + "-logo").click();
    }

    handleUpdate(mapEntities) {
        let propertiesByCountry =
            partitionBy(mapEntities.properties, (property) => property.country.code);
        let unitsByCountry =
            partitionBy(mapEntities.units, (unit) => unit.country.code);

        for (let playerId in this.playerPanels) {
            let playerPanel = this.playerPanels[playerId];
            let countryCode = playerPanel.playerInfo.countries_code;

            let properties = propertiesByCountry[countryCode] || [];
            let units = unitsByCountry[countryCode] || [];
            playerPanel.setMapInfo(properties, units);
        }
    }

    handleUnitBuilt(property, builtUnitName) {
        let playerPanel = this.playerPanels[property.country.code];
        playerPanel.handleUnitBuilt(builtUnitName);
    }
}
