(function(){
    let snapshotElement = document.getElementById("awbw_enhancements-savestate-snapshot");
    if (!snapshotElement) {
        console.log("Couldn't find savestate snapshot element, aborting savestate injector monkey patching.");
        return;
    }

    // Monkey patch axios.post so that we can inject our own snapshot instead when requested.
    let oldPost = axios.post;
    let newPost = function(url, data, config) {
        console.log("interceptor observed post:", url, data, config);
        if (url === "api/moveplanner/planner_load_state.php") {
            if (snapshotElement.hasAttribute("data")) {
                let snapshotState = JSON.parse(snapshotElement.getAttribute("data"));
                snapshotElement.removeAttribute("data");
                console.log("Found snapshot injection request with state:", snapshotState);

                // TODO: add fast path if the fog array is identical.
                if (snapshotState.fogArray) {
                    console.log("Detected fog array, querying server for fogImage");

                    var blob = new Blob([JSON.stringify(snapshotState)], {type : 'application/json'});
                    data.set("plannerState", new File([blob], "fake_filename.json"));
                    return oldPost(url, data, config).then((res) => {
                        let modifiedState = res.data;
                        if (typeof(modifiedState) == "string") {
                            return res;
                        }

                        snapshotState.fogImage = modifiedState.fogImage;
                        return {data: snapshotState};
                    });
                }
                return new Promise((resolve, reject) => {
                    resolve({data: snapshotState});
                });
            } else {
                console.log("No snapshot injection request found, allowing axios.post to proceed.");
            }
        }
        return oldPost(url, data, config);
    };
    axios.post = newPost;

    // Use a click event listener as a roundabout way of letting the SavestateManager trigger onchange()
    snapshotElement.addEventListener("click", (event) => {
        let lsi = document.getElementById("load-state-input");
        lsi.onchange();
    });
})();
