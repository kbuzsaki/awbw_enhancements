// TODO: implement tag cos
function templatePlayerOverviewCo(playerInfo, liveInfo) {
    let eliminated = liveInfo.eliminated;
    let coName = playerInfo.co_name.toLowerCase().replace(" ", "");
    let d2dText = "d2d text goes here";
    let clockText = "--:--:--";
    let funds = liveInfo.funds;
    return `
<div class="player-overview-co ${eliminated ? 'player-overview-eliminated-bg' : ''}">
  <span class="player-activity-status"></span>
  <span class="player-co-container co-container">
    <a class="player-co" href="co.php#${coName}" target="_blank">
      <img src="terrain/aw2/ds${coName}.png">
    </a>
    <!-- d2d text
    <span class="player-co-text hover-text">${d2dText}</span>
    -->
  </span>
  <span>
    <div class="player-overview-timer">
      <img src="terrain/bootaetclock.gif">
      <span class="player-timer ${eliminated ? 'strikethrough italic' : ''}">
        ${clockText}
      </span>
    </div>
    <div>
      <img style="margin-left: 2px; width: 12px" src="terrain/coin.gif">
      <span class="player-funds ${eliminated ? 'italic' : ''}">${funds}</span>
    </div>
  </span>
</div>`;
}

function templatePlayerUnitList(playerInfo, playerUnits) {
    let unitCounts = {};
    for (let unit of playerUnits) {
        if (!(unit.unit in unitCounts)) {
            unitCounts[unit.unit] = 0;
        }
        unitCounts[unit.unit] += 1;
    }

    let unitListHtml = "";
    for (let unitId of kUnitNamesInMenuOrder) {
        if (!(unitId in unitCounts)) {
            continue;
        }

        // TODO: adjust the base url
        let url = "https://awbw.amarriner.com/terrain/ani/" + playerInfo.countries_code + unitId + ".gif";
        let count = unitCounts[unitId];
        unitListHtml += `
            <div class="unit-count-${unitId}">
                <div>
                <img src="${url}" alt="Unit-count sprite">
                </div>
                <span> x ${count} </span>
            </div>
        `;
    }
    return unitListHtml;
}

function templatePlayerOverviewInfo(playerInfo, liveInfo, playerUnits) {
    let eliminated = liveInfo.eliminated;
    let countryCode = playerInfo.countries_code;
    let unitCount = liveInfo.unit_count;
    let unitValue = liveInfo.unit_value;
    let income = liveInfo.income;

    let unitListHtml = templatePlayerUnitList(playerInfo, playerUnits);
    return `
<div class="player-overview-info">
  <ul class="awbwhelper-${countryCode}-player-border">
    <!-- # of units -->
    <li class="player-overview-unit-count">
      <img src="terrain/ani/${countryCode}infantry.gif">
      <span class="player-overview-units-total unit-count">
        <span class="unit-count-total ${eliminated ? 'italic' : ''}">${unitCount}</span>
      </span>
      <div class="unit-count-display">
        <div>
          ${unitListHtml}
        </div>
      </div>
    </li>
    <li>
      <span class="unit-value-icon">
        <img src="terrain/ani/${countryCode}infantry.gif">
        <img class="coin" src="terrain/coin.gif">
      </span>
      <span class="unit-value ${eliminated ? 'italic' : ''}">${unitValue}</span>
    </li>
    <li>
      <img style="margin-left: 3px" src="terrain/capt.gif">
      <span class="player-income ${eliminated ? 'italic' : ''}">${income}</span>
    </li>
  </ul>
</div>`;
}

function templatePlayerOverview(playerInfo, liveInfo, playerUnits) {
    let playerId = playerInfo.players_id;
    let username = playerInfo.users_username;
    let countryCode = playerInfo.countries_code;
    let eliminated = liveInfo.eliminated;
    let overviewCoHtml = templatePlayerOverviewCo(playerInfo, liveInfo);
    let overviewInfoHtml = templatePlayerOverviewInfo(playerInfo, liveInfo, playerUnits);
    return `
<div class="player-overview">
  <div class="player-overview-content">
    <div class="player-overview-main">
      <header class="awbwhelper-${countryCode}-player-banner">
        <span class="player-username ${eliminated ? 'striked' : ''}">
          <a href="profile.php?username=${username}" target="_blank">${username}</a>
        </span>
        <img src="terrain/aw2/${countryCode}logo.gif" class="player-country-logo">
        ${liveInfo.is_current_turn ?
          '<img src="terrain/yourturn_arrow.gif" class="current-turn-arrow">' : ''}
      </header>
      ${overviewCoHtml}
    </div>
  </div>
  ${overviewInfoHtml}
</div>`;
}

function templateBars(numBars, isSuper) {
  let widthFraction = 100 / numBars;

  // TODO: implement power bar fill

  let openBarHtml = `
<div class="${isSuper ? 'scop-star' : 'cop-star'} power-star"
     style="width: ${widthFraction}%; border-right: none">
  <div class="power-star-percent" style="width: 0px;"></div>
</div>`;
  let closedBarHtml = `
<div class="${isSuper ? 'scop-star' : 'cop-star'} power-star"
     style="width: ${widthFraction}%; border-right: 1px solid black">
  <div class="power-star-percent" style="width: 0px;"></div>
</div>`;

  if (isSuper) {
    return openBarHtml.repeat(numBars - 1) + closedBarHtml;
  } else {
    return openBarHtml.repeat(numBars);
  }
}

function templatePlayerOverviewBar(playerInfo, liveInfo) {
  let copBars = playerInfo.co_max_power / 90000;
  let scopBars = (playerInfo.co_max_spower - playerInfo.co_max_power) / 90000;

  // Special handling for Von Bolt
  if (playerInfo.co_max_power === playerInfo.co_max_spower) {
    scopBars = copBars;
    copBars = 0;
  }

  let copBarsHtml = templateBars(copBars, false);
  let scopBarsHtml = templateBars(scopBars, true);
  return `
<div class="player-overview-bar">
  <div class="main-co-bar co-bar-container">
    <div class="power-bar" data-bar-pid="1299237" style="visibility: visible">
      <div class="co-power" style="width: ${ 100 * (copBars / (copBars + scopBars)) }%">
        ${copBarsHtml}
      </div>
      <div class="super-co-power" style="width: ${ 100 * (scopBars / (copBars + scopBars)) }%">
        ${scopBarsHtml}
      </div>
    </div>
  </div>
</div>`;
}

function templateEndTurnButton(playerInfo, liveInfo) {
  if (!liveInfo.is_current_turn) {
    return "";
  }
  return `
<div class="js-end-turn-btn game-tools-btn"
     style="width: 55px; margin-left: 5px; display: flex;">
  <div class="game-tools-bg">
    <img src="terrain/endturn.gif" style="vertical-align:middle;">
    <b class="small_text" style="vertical-align:middle;">End</b>
  </div>
  <span class="game-tools-btn-text small_text">End Turn</span>
</div>`;
}

function templatePlayerHtml(playerInfo, liveInfo, playerUnits) {
  let playerOverview = templatePlayerOverview(playerInfo, liveInfo, playerUnits);
  let playerBar = templatePlayerOverviewBar(playerInfo, liveInfo);
  let endTurnButton = templateEndTurnButton(playerInfo, liveInfo);

  return `
<div class="awbwhelper-player-entry">
  <div class="awbwhelper-player-banner">
    <div class="awbwhelper-player-status">
      ${playerOverview}
    </div>
    <div class="awbwhelper-player-controls">
      ${endTurnButton}
    </div>
  </div>
  <div class="awbwhelper-player-bar">
    ${playerBar}
  </div>
</div>
`;
}

// Reimplementation of the AWBW "player panel" for the move planner
class PlayerPanel {
    constructor(parentPanel, playerInfo, endTurnCallback) {
        this.parentPanel = parentPanel;
        // note that this is only the player info on page-load,
        // it does not update after changes to the map
        this.playerInfo = playerInfo;
        this.liveInfo = {
            is_current_turn: playerInfo.is_current_turn,
            eliminated: (playerInfo.players_eliminated === "Y"),
            funds:  playerInfo.players_funds,
            income: playerInfo.players_income || 0,
            unit_count: 12,
            unit_value: 100,
        };
        this.playerUnits = [];

        this.endTurnCallback = endTurnCallback;

        this.panel = document.createElement("div");
        this.panel.id = "player" + playerInfo.players_id;
        this.panel.classList.add("player-overview-container");

        this.parentPanel.appendChild(this.panel);
        this.updateHtml();
    }

    assembleSavestateData() {
        // TODO: filter to only specific fields?
        return this.liveInfo;
    }

    applySavestateData(data) {
        console.log("panel:", this.playerInfo, "received savestate data:", data);
        this.liveInfo.is_current_turn = data.is_current_turn;
        this.liveInfo.funds = data.funds;
        this.updateHtml();
    }

    generateHtml() {
        return templatePlayerHtml(this.playerInfo, this.liveInfo, this.playerUnits);
    }

    updateHtml() {
        this.panel.innerHTML = this.generateHtml();

        let endTurnButton = this.panel.getElementsByClassName("js-end-turn-btn");
        if (endTurnButton.length !== 0) {
            endTurnButton[0].addEventListener("click", (event) => {
                console.log("Clicked end turn!");
                this.endTurnCallback();
            });
        }
    }

    getCoFundsPerProperty() {
        let coName = this.playerInfo.co_name;
        if (coName === "Sasha") {
            return fundsPerProperty + 100;
        }
        return fundsPerProperty;
    }

    getCoUnitValueCoefficient() {
        // TODO: handle Hachi SCOP pricing
        let coName = this.playerInfo.co_name;
        if (coName === "Colin") return 0.8;
        if (coName === "Kanbei") return 1.2;
        if (coName === "Hachi") return 0.9;
        return 1;
    }

    setMapInfo(properties, units) {
        this.playerUnits = units;

        let incomeProperties = properties.filter((p) => p.producesIncome()).length;
        let income = incomeProperties * this.getCoFundsPerProperty();

        let unitCount = units.length;
        let unitValue = 0;
        for (let unit of units) {
            unitValue += unit.unitValue() * this.getCoUnitValueCoefficient();
        }

        this.liveInfo.income = income;
        this.liveInfo.unit_count = unitCount;
        this.liveInfo.unit_value = unitValue;

        this.updateHtml();
    }

    startTurn() {
        // TODO: handle repairs
        this.liveInfo.funds += this.liveInfo.income;
        this.liveInfo.is_current_turn = true;
        this.updateHtml();
    }

    endTurn() {
        this.liveInfo.is_current_turn = false;
        this.updateHtml();
    }

    // TODO: allow manually setting funds to handle cases where a unit needs to be
    // created but wasn't "built" (e.g. because it's being unloaded from a transport)
    handleUnitBuilt(builtUnitName) {
        // TODO: how to handle mistaken builds? undo last purchase button and stack?
        let unitData = lookupUnitDataByBuildMenuName(builtUnitName);
        this.liveInfo.funds -= unitData.cost * this.getCoUnitValueCoefficient();
        this.updateHtml();
    }
}
