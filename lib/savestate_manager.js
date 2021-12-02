const kSnapshotButtonsHtml = `
<td colspan="4">
  <div class="awbwhelper-btn-container">
    <div id="planner-snapshot-state" class="awbwhelper-btn"
         title="Snapshot the current board state without downloading a savestate file.">
      Snapshot
    </div>
    <div id="planner-restore-state" class="awbwhelper-btn"
         title="Restore the selected snapshot.">
      Restore
    </div>
    <select id="planner-snapshot-selecter" class="awbwhelper-select">
      <option></option>
    </select>
  </div>
</td>`;


function setButtonText(button, text) {
    for (let node of button.childNodes) {
        if (node.nodeType === Node.TEXT_NODE) {
            node.nodeValue = text;
            return;
        }
    }
}

function appendSnapshotButtons(controlsTable) {
    let tbody = controlsTable.getElementsByTagName("tbody")[0];
    let newTr = document.createElement("tr");
    newTr.innerHTML = kSnapshotButtonsHtml;
    tbody.appendChild(newTr);
}

class SavestateManager {
    constructor(controlsTable, savestateInterceptor) {
        this.controlsTable = controlsTable;
        this.savestateInterceptor = savestateInterceptor;

        this.snapshots = [];
        this.manualSnapshotCounter = 0;

        this.downloadStateButton = document.getElementById("planner-save-state");
        setButtonText(this.downloadStateButton, "Download State");
        this.downloadStateButton.title = "Download a savestate file that can be uploaded later.";
        this.uploadStateButton = document.getElementById("planner-load-state");
        setButtonText(this.uploadStateButton, "Upload State");
        this.uploadStateButton.title = "Upload a savestate file that was downloaded previously.";

        appendSnapshotButtons(this.controlsTable);
        this.snapshotStateButton = document.getElementById("planner-snapshot-state");
        this.snapshotStateButton.addEventListener("click", this.onSnapshotStateClick.bind(this));
        this.restoreStateButton = document.getElementById("planner-restore-state");
        this.restoreStateButton.addEventListener("click", this.onRestoreStateClick.bind(this));
        this.snapshotSelecter = document.getElementById("planner-snapshot-selecter");
    }

    takeSnapshot(snapshotName, explicitSnapshot) {
        this.savestateInterceptor.takeNextSnapshot((snapshot) => {
            console.log("manager got snapshot:", snapshot);
            this.snapshots.push({
                name: snapshotName,
                data: JSON.parse(JSON.stringify(snapshot))
            });
            if (explicitSnapshot) {
                this.lastSnapshotIndex = this.snapshots.length - 1;
            }
            this.updateSnapshotSelecter();
        });
        // TODO: refactor so that the interceptor handles this for us?
        this.downloadStateButton.click();
    }

    updateSnapshotSelecter() {
        let hasDefaultOption = this.snapshotSelecter.options[this.snapshotSelecter.options.length - 1].value === "";
        let startIndex = this.snapshotSelecter.options.length - (hasDefaultOption ? 1 : 0);
        for (let i = startIndex; i < this.snapshots.length; i++) {
            let snapshot = this.snapshots[i];
            let option = new Option(snapshot.name, i, true, true);
            this.snapshotSelecter.add(option, 0);
        }
        if (hasDefaultOption) {
            this.snapshotSelecter.options[this.snapshotSelecter.options.length - 1].remove();
        }
    }

    getStateSnapshotToInject() {
        let snapshotIndex = parseInt(this.snapshotSelecter.options[this.snapshotSelecter.selectedIndex].value);
        let snapshot = JSON.parse(JSON.stringify(this.snapshots[snapshotIndex].data));
        // TODO: get actual terrain path for this user on page load
        snapshot.terrainPath = "https://awbw.amarriner.com/terrain/ani/";
        return snapshot;
    }

    onTurnStart(day, player) {
        let name = "Day " + day + " - " + player;
        name += " (" + (new Date()).toLocaleTimeString() + ")";
        this.takeSnapshot(name, /*explicitSnapshot=*/false);
    }

    onSnapshotStateClick() {
        let name = "Snapshot " + ++this.manualSnapshotCounter;
        name += " (" + (new Date()).toLocaleTimeString() + ")";
        this.takeSnapshot(name, /*explicitSnapshot=*/true);
    }

    onRestoreStateClick() {
        let savestateData = this.getStateSnapshotToInject();

        // Put the snapshot that we want to restore in the special node
        let snapshotElement = document.getElementById("awbw_helper-savestate-snapshot");
        snapshotElement.setAttribute("data", JSON.stringify(savestateData));
        // Then click the node to kick off the load trigger in the injected script.
        snapshotElement.click();

        this.savestateInterceptor.restoreSavestate(savestateData);
    }
}
