const kPlayerInfoPanelHtml = `<div class="game-player-info" style="height: 160px; flex-wrap: nowrap; left: 100%; position: static; margin-left: 20px; overflow-y: visible; width: auto;">`;

class PlayersPanel {
    constructor(parentNode, players) {
        this.parentNode = parentNode;
        this.players = players;

        this.playerInfoContainer = htmlToNode(kPlayerInfoPanelHtml);
        this.parentNode.appendChild(this.playerInfoContainer);

        this.playerPanels = {};
        for (let playerInfo of players) {
            let playerPanel = new PlayerPanel(this.playerInfoContainer, playerInfo);
            this.playerPanels[playerInfo.countries_code] = playerPanel;
        }
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
}
