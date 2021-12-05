chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === "get_own_tab_id") {
        sendResponse({tabId: sender.tab.id});
    }
});

function classifyDownload(downloadItem) {
    // Only intercept moveplanner blobs that don't have the modified tag.
    let isSavestate = downloadItem.mime === "application/json"
                   && downloadItem.filename.endsWith("_moveplanner.json")
                   && downloadItem.finalUrl.startsWith("blob:");

    let isModified = downloadItem.finalUrl.endsWith("#awbw_helper_modified");
    let tabId = undefined;
    if (downloadItem.finalUrl.indexOf("#awbw_helper_unmodified") !== -1) {
        let segments = downloadItem.finalUrl.split("-");
        tabId = parseInt(segments[segments.length - 1]);
    }

    return {isSavestate, isModified, tabId};
}

// Use onDeterminingFilename rather than onCreated so that we can get the filename
chrome.downloads.onDeterminingFilename.addListener((downloadItem) => {
    chrome.storage.sync.get({
        options_enable_savestate_interception: true
    }, (result) => {
        console.log("interceptor with options", result, "inspecting download", downloadItem);
        if (!result.options_enable_savestate_interception) {
            return;
        }

        let classification = classifyDownload(downloadItem);
        console.log("classification", classification);
        if (!classification.isSavestate || classification.isModified) {
            // Ignore, it's either not a savestate or it's the final modified data to download
            console.log("*** NOT intercepting download:", downloadItem);
        } else if (classification.tabId === undefined) {
            // It's an unidentified download, so cancel it outright
            console.log("Canceling unidentified savestate download");
            chrome.downloads.cancel(downloadItem.id);
        } else {
            // It's an identified download that we need to intercept
            console.log("Intercepting download", downloadItem, "from tab", classification.tabId);
            // Cancel the download and proxy its details to the content-script for rewriting
            chrome.downloads.cancel(downloadItem.id);
            chrome.tabs.sendMessage(classification.tabId, {
                type: "savestate_download",
                filename: downloadItem.filename,
                finalUrl: downloadItem.finalUrl,
            });
        }
    });
});
