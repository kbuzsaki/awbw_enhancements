class SavestateInterceptor {
    constructor(loadStateInput, stateSources) {
        this.loadStateInput = loadStateInput;
        this.stateSources = stateSources;
        this.stateSourcesById = toDict(stateSources, (source) => source.stateId());

        // Handler for rewriting savestate downloads that were intercepted by
        // the service worker.
        chrome.runtime.onMessage.addListener((message, sender) => {
            if (message.type !== "savestate_download") return;
            this.onSavestateDownloadIntercepted(message);
        });

        this.loadStateInput.addEventListener("change", this.onSavestateUploaded.bind(this));
    }

    assembleExtraSavestateData() {
        let datas = [];
        for (let source of this.stateSources) {
            let sourceId = source.stateId();
            let data = source.assembleSavestateData();
            datas.push({sourceId, data});
        }
        return {states: datas};
    }

    publishExtraSavestateData(extraData) {
        for (let state of extraData.states) {
            let source = this.stateSourcesById[state.sourceId];
            if (source) {
                source.applySavestateData(state.data);
            } else {
                console.log("Found savestate data without handler:", state);
            }
        }
    }

    patchSavestateData(savestateData) {
        // Certain units sometimes have their build menu name (e.g. "Black Boat") which is
        // not the same as their file name (e.g. "blackboat"). This causes their images
        // to be broken when a savestate is loaded.
        for (let unitId in savestateData.unitsState) {
            let unitState = savestateData.unitsState[unitId];
            // Check if the unit name is the build menu name. If it is then patch it
            // to be the file name.
            let unit = lookupUnitDataByBuildMenuName(unitState.units_name);
            if (unit) {
                unitState.units_name = unit.name;
            }
        }
    }

    onSavestateUploaded() {
        let file = this.loadStateInput.files[0];

        const reader = new FileReader();
        reader.onload = (event) => {
            let savestateData = JSON.parse(event.target.result);
            console.log("savestate loaded:", savestateData);
            this.publishExtraSavestateData(savestateData.awbw_helper_extras);
        };
        reader.readAsText(file);
    }

    onSavestateDownloadIntercepted(message) {
        // Download the intercepted savestate ourselves
        let xhr = new XMLHttpRequest();
        xhr.addEventListener("load", (event) => {
            // Parse the data out as json and add our extra data
            // TODO: consider patching actual savestate data to fix the broken image bug?
            let savestateData = JSON.parse(xhr.responseText);
            this.patchSavestateData(savestateData);
            savestateData.awbw_helper_extras = this.assembleExtraSavestateData();

            // Then restart the download with a sentinel so that it isn't intercepted as well.
            const url = window.URL.createObjectURL(
                new Blob([JSON.stringify(savestateData)], {type: "application/json"}));
            const a = document.createElement("a");
            a.href = url + "#awbw_helper_modified";
            a.download = message.filename;
            document.body.appendChild(a);
            a.click();
        });
        xhr.open("GET", message.finalUrl, true);
        xhr.send();
    }
}



