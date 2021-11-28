class SavestateInterceptor {
    constructor(loadStateInput) {
        this.loadStateInput = loadStateInput;

        // Handler for rewriting savestate downloads that were intercepted by
        // the service worker.
        chrome.runtime.onMessage.addListener((message, sender) => {
            if (message.type !== "savestate_download") return;
            this.onSavestateDownloadIntercepted(message);
        });

        this.loadStateInput.addEventListener("change", this.onSavestateUploaded.bind(this));
    }

    onSavestateUploaded() {
        let file = this.loadStateInput.files[0];

        const reader = new FileReader();
        reader.onload = function(event) {
            let savestateData = JSON.parse(event.target.result);
            console.log("savestate loaded:", savestateData);
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
            // TODO: hook in actual awbw helper state that we need to persist
            savestateData["awbw_helper_extras"] = {todo: "data goes here"};

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



