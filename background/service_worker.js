function classifyDownload(downloadItem) {
    // Only intercept moveplanner blobs that don't have the modified tag.
    let isSavestate = downloadItem.mime === "application/json"
                   && downloadItem.filename.endsWith("_moveplanner.json")
                   && downloadItem.finalUrl.startsWith("blob:");
    let isModified = downloadItem.finalUrl.endsWith("#awbw_enhancements_modified");

    return {isSavestate, isModified};
}

// Use onDeterminingFilename rather than onCreated so that we can get the filename
chrome.downloads.onDeterminingFilename.addListener((downloadItem, suggest) => {
    chrome.storage.sync.get({
        options_enable_moveplanner_plus: true,
        options_enable_savestate_interception: true
    }, (result) => {
        console.log("interceptor with options", result, "inspecting download", downloadItem);
        if (!result.options_enable_moveplanner_plus
         || !result.options_enable_savestate_interception) {
            suggest();
            return;
        }

        let classification = classifyDownload(downloadItem);
        console.log("classification", classification);
        if (classification.isSavestate && !classification.isModified) {
            // It's a savestate download that wasn't triggered by us, so cancel it
            console.log("Canceling unidentified savestate download");
            chrome.downloads.cancel(downloadItem.id);
            suggest();
        } else {
            // Ignore, it's either not a savestate or it's the final modified data to download
            console.log("*** NOT intercepting download:", downloadItem);
            suggest();
        }
    });

    return true;
});
