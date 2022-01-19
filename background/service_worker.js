function isReplayDownload(item) {
    return item.url.includes("replay_download.php") && item.mime === "application/zip";
}

function getGameId(item) {
    let search = item.url.substring(item.url.indexOf("?"));
    let urlParams = new URLSearchParams(search);
    if (urlParams.has("games_id")) {
        return parseInt(urlParams.get("games_id"));
    }
    return undefined;
}

chrome.downloads.onDeterminingFilename.addListener((downloadItem, suggest) => {
    chrome.storage.sync.get({
        // TODO: option
        options_enable_savestate_interception: true
    }, (result) => {
        console.log("interceptor with options", result, "inspecting download", downloadItem);

        if (!isReplayDownload(downloadItem)) {
            // Ignore, it's either not a savestate or it's the final modified data to download
            console.log("*** NOT renaming download:", downloadItem);
            suggest();
            return;
        }

        let gameId = getGameId(downloadItem);
        if (gameId === undefined) {
            console.log("Failed to get game id for download:", downloadItem);
            suggest();
            return;
        }
        console.log("got game id:", gameId);

        fetch("https://awbw.amarriner.com/api/game/load_replay.php", {
            method: "POST",
            body: JSON.stringify({
                gameId: gameId,
                turn: 1,
                initial: false,
            }),
        }).then((resp) => {
            return resp.json();
        }).then((json) => {
            // TODO: add map name
            let players = json.gameState.players;

            let playerStrs = Object.values(players).map((player) => {
                return player.users_username + " (" + player.co_name + ")";
            });

            let filename = "" + gameId + " - " + playerStrs.join(" vs ") + ".zip";
            suggest({filename});
        }).catch((e) => {
            console.log("Encountered error while loading player data for replay download:", e);
            suggest();
        });
    });

    return true;
});
