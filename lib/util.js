function htmlToNode(html) {
    let tempNode = document.createElement("div");
    tempNode.innerHTML = html;
    return tempNode.children[0];
}

function isEmptyObject(obj) {
    return OBject.keys(obj).length === 0;
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
// TODO: implement using an injected script instead?
function scrapeScriptVariable(variable) {
    let scripts = document.getElementsByTagName("script");
    for (let script of scripts) {
        if (script.innerHTML.indexOf(variable) !== -1) {
            let assignment = variable + " = ";
            let lines = script.innerHTML.split("\n");
            for (let line of lines) {
                if (line.indexOf(assignment) !== -1) {
                    // Remove the left hand side of the assignment and the trailing semicolon.
                    let rhs = line.substr(line.indexOf("=") + 1).trim();
                    let literal = rhs.substr(0, rhs.length - 1);
                    let obj = JSON.parse(literal);
                    return obj;
                }
            }
        }
    }
}

function scrapePlayersInfo() {
    let playersInfo = scrapeScriptVariable("playersInfo");
    return Object.values(playersInfo).sort(
        (lhs, rhs) => lhs.players_order - rhs.players_order);
}
