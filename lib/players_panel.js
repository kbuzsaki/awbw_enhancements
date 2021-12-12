const kSidebarContainerHtml = `
<div id="awbwhelper-sidebar-container" class="awbwhelper-sidebar-container">
  <div id="awbwhelper-players-panel" class="awbwhelper-sidebar-entry"></div>
  <div id="awbwhelper-removed-units"></div>
</div>
`;

const kPlayerInfoPanelHtml = `<div class="game-player-info" style="height: 160px; flex-wrap: nowrap; left: 100%; position: static; margin-left: 20px; overflow-y: visible; width: auto;">`;

class PlayersPanel {
    constructor(replayContainer, players) {
        this.replayContainer = replayContainer;
        this.players = players;
        // TODO: restore day state from snapshot
        // TODO: get the actual day by scraping 2030.php?
        this.day = 1;
        this.turnStartListeners = [];

        this.sidebarContainer = htmlToNode(kSidebarContainerHtml);
        this.replayContainer.appendChild(this.sidebarContainer);

        this.playerInfoContainer = document.getElementById("awbwhelper-players-panel");
        this.removedUnitsContainer = document.getElementById("awbwhelper-removed-units");
        this.removedUnitsContainer.appendChild(document.getElementById("planner_removed_units"));

        this.playerPanels = {};
        for (let i = 0; i < this.players.length; i++) {
            let playerInfo = this.players[i];
            let playerPanel = new PlayerPanel(this.playerInfoContainer, playerInfo, () => {
                this.handleTurnEndedFor(i);
            });
            this.playerPanels[playerInfo.countries_code] = playerPanel;
        }
    }

    addTurnStartListener(listener) {
        this.turnStartListeners.push(listener);
    }

    stateId() {
        return "players_panel";
    }

    assembleSavestateData() {
        let panelStates = [];
        for (let countryCode in this.playerPanels) {
            let playerPanel = this.playerPanels[countryCode];
            panelStates.push({
                country_code: countryCode,
                state: playerPanel.assembleSavestateData(),
            });
        }
        return {day: this.day, panel_states: panelStates};
    }

    applySavestateData(data) {
        if (data.day !== undefined) {
            this.day = data.day;
        }

        for (let {country_code, state} of data.panel_states) {
            let playerPanel = this.playerPanels[country_code];
            playerPanel.applySavestateData(state);
        }
    }

    startFirstTurn() {
        let currentPlayer;
        for (let countryCode in this.playerPanels) {
            let panel = this.playerPanels[countryCode];
            if (panel.liveInfo.is_current_turn) {
                currentPlayer = panel.playerInfo.users_username;
            }
        }

        for (let listener of this.turnStartListeners) {
            listener(this.day, currentPlayer);
        }
    }

    handleTurnEndedFor(endedIndex) {
        // TODO: add a day counter?
        let nextIndex = (endedIndex + 1) % this.players.length;
        if (nextIndex == 0) {
            this.day += 1;
        }

        let endedPlayer = this.players[endedIndex];
        let endedPanel = this.playerPanels[endedPlayer.countries_code];
        endedPanel.endTurn();
        document.getElementById(endedPlayer.countries_code + "-logo").click();
        document.getElementById("unwait-all").click();

        let nextPlayer = this.players[nextIndex];
        let nextPanel = this.playerPanels[nextPlayer.countries_code];
        nextPanel.startTurn();
        document.getElementById(nextPlayer.countries_code + "-logo").click();

        for (let listener of this.turnStartListeners) {
            listener(this.day, nextPlayer.users_username);
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

    handleUnitBuilt(property, builtUnitName) {
        let playerPanel = this.playerPanels[property.country.code];
        playerPanel.handleUnitBuilt(builtUnitName);
    }
}
