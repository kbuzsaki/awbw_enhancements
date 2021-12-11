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

function invertDict(d) {
    let out = {};
    for (let k in d) {
        for (let v of d[k]) {
            if (!(v in out)) {
                out[v] = [];
            }
            out[v].push(k);
        }
    }
    return out;
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

function maxMajorDimension(matrix) {
    if (Array.isArray(matrix)) {
        return matrix.length;
    } else {
        // Plus 1 because length is 1 greater than the largest valid index.
        return Object.keys(matrix).reduce((ac, el) => Math.max(parseInt(ac), parseInt(el))) + 1;
    }
}

function maxMinorDimension(matrix) {
    if (!Array.isArray(matrix)) {
        matrix = Object.values(matrix);
    }
    return matrix.map((el) => maxMajorDimension(el)).reduce((ac, el) => Math.max(ac, el));
}

function mergeMatrices() {
    let output = {};
    for (let matrix of Array.from(arguments)) {
        for (let rowId in matrix) {
            if (!(rowId in output)) {
                output[rowId] = {};
            }
            let outputRow = output[rowId];

            let row = matrix[rowId];
            for (let colId in row) {
                if (colId in outputRow) {
                    console.log("mergeMatrices found duplicate entry for rowId", rowId, ", colId", colId);
                }
                let cell = row[colId];
                outputRow[colId] = cell;
            }
        }
    }
    return output;
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

function scrapeTerrainInfo() {
    return scrapeScriptVariable("terrainInfo");
}

function scrapeBuildingsInfo() {
    return scrapeScriptVariable("buildingsInfo");
}
