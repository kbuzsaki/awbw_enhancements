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

    // Watch for savestate download anchors to be inserted, then intercept them if they're a savestate.
    onBodyMutated(mutations) {
        for (let mutation of mutations) {
            for (let addedNode of mutation.addedNodes) {
                if (addedNode.tagName === "A"
                && addedNode.download !== ""
                && addedNode.href.indexOf("blob:https://awbw.amarriner.com/") === 0
                && addedNode.href.indexOf("#") === -1) {
                    this.onSavestateDownloadIntercepted({
                        filename: addedNode.download,
                        finalUrl: addedNode.href
                    });
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
        let downloadModifiedSavestate = (message) => {
            fetch(message.finalUrl)
            .then((response) => response.json())
            .then((savestateData) => {
                // Parse the data out as json and add our extra data
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
        };

        OptionsReader.instance().onOptionsReady().then((options) => {
            if (options.options_enable_savestate_interception) {
                downloadModifiedSavestate(message);
            } else {
                console.log("Savestate interception was disabled after page load, aborting second download.");
            }
        }).catch((error) => {
            console.log("Got error while reading options:", error);
            if (error.message.indexOf("Extension context invalidated.") !== -1) {
                console.log("Can't determine whether savestate interception is enabled, defaulting to true.");
                downloadModifiedSavestate(message);
            }
        });

    }

    takeNextSnapshot(callback) {
        this.takeNextSnapshotCallback = callback;
    }
}



