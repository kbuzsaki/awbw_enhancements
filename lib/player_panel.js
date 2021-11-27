// TODO: implement tags
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
    <!-- d2d text -->
    <span class="player-co-text hover-text">${d2dText}</span>
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

function templatePlayerOverviewInfo(playerInfo, liveInfo) {
    let countryCode = playerInfo.countries_code;
    let unitCount = liveInfo.unit_count;
    let unitValue = liveInfo.unit_value;
    let income = liveInfo.income;
    return `
<div class="player-overview-info">
  <ul class="awbwhelper-${countryCode}-player-border">
    <!-- # of units -->
    <li class="player-overview-unit-count">
      <img src="terrain/ani/${countryCode}infantry.gif">
      <span class="player-overview-units-total unit-count">
        <span class="unit-count-total">${unitCount}</span>
      </span>
    </li>
    <li>
      <span class="unit-value-icon">
        <img src="terrain/ani/${countryCode}infantry.gif">
        <img class="coin" src="terrain/coin.gif">
      </span>
      <span class="unit-value ">${unitValue}</span>
    </li>
    <li>
      <img style="margin-left: 3px" src="terrain/capt.gif">
      <span class="player-income">${income}</span>
    </li>
  </ul>
</div>`;
}

function templatePlayerOverview(playerInfo, liveInfo) {
    let playerId = playerInfo.players_id;
    let username = playerInfo.users_username;
    let countryCode = playerInfo.countries_code;
    let eliminated = liveInfo.eliminated;
    let overviewCoHtml = templatePlayerOverviewCo(playerInfo, liveInfo);
    let overviewInfoHtml = templatePlayerOverviewInfo(playerInfo, liveInfo);
    // TODO: template power bar
    // TODO: fix gradients
    return `
<div class="player-overview">
  <div class="player-overview-content">
    <div class="player-overview-main">
      <header class="awbwhelper-${countryCode}-player-banner">
        <span class="player-username ${eliminated ? 'striked' : ''}">
          <a href="profile.php?username=${username}" target="_blank">${username}</a>
        </span>
        <img src="terrain/aw2/${countryCode}logo.gif" class="player-country-logo">
      </header>
      ${overviewCoHtml}
    </div>
  </div>
  ${overviewInfoHtml}
</div>`;
}

// Reimplementation of the AWBW "player panel" for the move planner
// TODO: how to handle save states?
class PlayerPanel {
    constructor(parentPanel, playerInfo) {
        this.parentPanel = parentPanel;
        // note that this is only the player info on page-load,
        // it does not update after changes to the map
        this.playerInfo = playerInfo;
        this.liveInfo = {
            eliminated: (playerInfo.players_eliminated === "Y"),
            funds:  playerInfo.players_funds,
            income: playerInfo.players_income || 0,
            unit_count: 12,
            unit_value: 100,
        };

        this.panel = document.createElement("div");
        this.panel.id = "player" + playerInfo.players_id;
        this.panel.classList.add("player-overview-container");

        this.parentPanel.appendChild(this.panel);
        this.updateHtml();
    }

    generateHtml() {
        return templatePlayerOverview(this.playerInfo, this.liveInfo);
    }

    updateHtml() {
        this.panel.innerHTML = this.generateHtml();
    }

    setMapInfo(properties, units) {
        let income = 0;
        for (let property of properties) {
            if (property.producesIncome()) {
                income += 1000;
            }
        }

        let unitCount = units.length;
        let unitValue = 0;
        for (let unit of units) {
            unitValue += unit.unitValue();
        }

        this.liveInfo.income = income;
        this.liveInfo.unit_count = unitCount;
        this.liveInfo.unit_value = unitValue;

        this.updateHtml();
    }
}
