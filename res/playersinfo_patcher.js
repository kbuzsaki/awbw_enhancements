(function() {
    let requestElement = document.getElementById("awbw_enhancements-playersInfo-patch");
    if (!requestElement) {
        console.log("playersInfo patcher failed to find request element! Aborting.");
        return;
    }

    requestElement.addEventListener("click", () => {
        let dataJson = requestElement.getAttribute("data");
        requestElement.removeAttribute("data");

        if (!dataJson) {
            console.log("playersInfo patcher received click with no data!");
            return;
        }

        let data = JSON.parse(dataJson);
        console.log("got patch data:", data);
        for (let patch of (data.patches || [])) {
            let playerInfo = playersInfo?.[patch.id];
            for (let key of Object.keys(patch.data || {})) {
                playerInfo[key] = patch.data[key];
            }
        }
    });
})();
