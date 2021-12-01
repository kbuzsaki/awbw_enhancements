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
            let savestateData = JSON.parse(xhr.responseText);
            savestateData.awbw_helper_extras = this.assembleExtraSavestateData();

            // If the next snapshot was requested by a client, deliver to them instead.
            if (this.takeNextSnapshotCallback) {
                let callback = this.takeNextSnapshotCallback;
                this.takeNextSnapshotCallback = undefined;
                callback(savestateData);
                return;
            }

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

    takeNextSnapshot(callback) {
        this.takeNextSnapshotCallback = callback;
    }
}



