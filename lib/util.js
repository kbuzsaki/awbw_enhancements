function htmlToNode(html) {
    let tempNode = document.createElement("div");
    tempNode.innerHTML = html;
    return tempNode.children[0];
}

function toDict(array, fn) {
    let data = {};
    for (let element of array) {
        let key = fn(element);
        data[key] = element;
    }
    return data;
}

function partitionBy(array, fn) {
    let data = {};
    for (let element of array) {
        let key = fn(element);
        if (!data.hasOwnProperty(key)) {
            data[key] = [];
        }
        data[key].push(element);
    }
    return data;
}


// Hack to get the json data that is embedded in a (templated?) script tag on the page
// TODO: also get terrain info from here?
function scrapePlayersInfo() {
    let scripts = document.getElementsByTagName("script");
    for (let script of scripts) {
        if (script.innerHTML.indexOf("playersInfo") !== -1) {
            let lines = script.innerHTML.split("\n");
            for (let line of lines) {
                if (line.indexOf("playersInfo = {") !== -1) {
                    let playersInfoLiteral = line.split("=")[1].split(";")[0].trim();
                    return JSON.parse(playersInfoLiteral);
                }
            }
        }
    }
}
