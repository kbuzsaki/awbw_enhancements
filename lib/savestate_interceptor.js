class SavestateInterceptor {
    constructor(options, loadStateInput, stateSources) {
        this.options = options;
        this.loadStateInput = loadStateInput;
        this.stateSources = stateSources;
        this.stateSourcesById = toDict(stateSources, (source) => source.stateId());

        let observer = new MutationObserver((mutations, observer) => {
            this.onBodyMutated(mutations);
        });
        observer.observe(document.body, {childList: true});

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
        // TODO: inform handlers that extra data was missing.
        if (extraData === undefined) {
            console.log("Savestate was missing extra data.");
            return;
        }

        for (let state of extraData.states) {
            let source = this.stateSourcesById[state.sourceId];
            if (source) {
                source.applySavestateData(state.data);
            } else {
                console.log("Found savestate data without handler:", state);
            }
        }
    }

    restoreSavestate(savestateData) {
        this.publishExtraSavestateData(savestateData.awbw_helper_extras);
    }

    // Watch for savestate download anchors to be inserted, then update them to include the tab id
    // This tells the service worker to send the intercepted download to our tab for metadata insertion
    // TODO: add escape hatch for downloading when the extension is upgraded
    onBodyMutated(mutations) {
        for (let mutation of mutations) {
            for (let addedNode of mutation.addedNodes) {
                if (addedNode.tagName === "A"
                && addedNode.download !== ""
                && addedNode.href.indexOf("blob:https://awbw.amarriner.com/") === 0
                && addedNode.href.indexOf("#") === -1) {
                    addedNode.href += "#awbw_helper_unmodified-" + this.options.ownTabId;
                    addedNode.click();
                }
            }
        }
    }

    // TODO: fix savestate upload bug with removed units?
    onSavestateUploaded() {
        let file = this.loadStateInput.files[0];

        const reader = new FileReader();
        reader.onload = (event) => {
            let savestateData = JSON.parse(event.target.result);
            console.log("savestate loaded:", savestateData);
            this.restoreSavestate(savestateData);
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



