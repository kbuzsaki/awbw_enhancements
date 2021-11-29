function shouldInterceptDownload(downloadItem) {
    // Only intercept moveplanner blobs that don't have the modified tag.
    return downloadItem.mime === "application/json"
        && downloadItem.filename.endsWith("_moveplanner.json")
        && downloadItem.finalUrl.startsWith("blob:")
        && !downloadItem.finalUrl.endsWith("#awbw_helper_modified");
}

// Use onDeterminingFilename rather than onCreated so that we can get the filename
chrome.downloads.onDeterminingFilename.addListener((downloadItem) => {
    if (shouldInterceptDownload(downloadItem)) {
        // Cancel the download and proxy its details to the content-script for rewriting
        chrome.downloads.cancel(downloadItem.id);
        chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
            chrome.tabs.sendMessage(tabs[0].id, {
                type: "savestate_download",
                filename: downloadItem.filename,
                finalUrl: downloadItem.finalUrl,
            });
        });
    }
});
