(function(){
    let snapshotElement = document.getElementById("awbw_helper-savestate-snapshot");
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
                console.log("Found snapshot injection request, redirecting axios.post to", snapshotState);
                snapshotElement.removeAttribute("data");
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
