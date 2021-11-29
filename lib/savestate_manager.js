const kSnapshotButtonsHtml = `
<td colspan="2">
  <div id="planner-snapshot-state" class="planner-tools-btn-lg planner-state-btn"
       title="Snapshot the current board state without downloading a savestate file.">
    <img src="terrain/savemap.gif">Snapshot State
  </div>
</td>
<td id="planner-load-section" colspan="2">
  <div for="load-state-input" id="planner-restore-state" class="planner-tools-btn-lg planner-state-btn"
       title="Restore the most recent state snapshot.">
    <img src="terrain/riseunhide.gif">Restore State
  </div>
</td>
`;

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
        this.stateSnapshot = undefined;

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
    }

    onSnapshotStateClick() {
        this.savestateInterceptor.takeNextSnapshot((snapshot) => {
            this.stateSnapshot = snapshot;
            console.log("manager got snapshot:", snapshot);
        });
        // TODO: refactor so that the interceptor handles this for us?
        this.downloadStateButton.click();
    }

    onRestoreStateClick() {
        if (!this.stateSnapshot) {
            alert("No state snapshotted yet!");
        }
    }
}
