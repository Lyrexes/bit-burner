import * as util from "util.js"
/** @param {NS} ns **/

const scripts = {
    "setup": "setup.js",
    "hack": "hack.js",
    "weaken": "weaken.js",
    "grow": "grow.js"
};

export async function main(ns) {
    //Auto buy darkweb scripts
    //Auto buy server
    util.killAllServers(ns, getServerList(ns));
    util.tryNukeAllServer(ns);
    const target = util.getBestServer(ns, util.getHackableServers(ns));
    const filesToCopy = Object.entries(scripts).map(( [k, v] ) =>  v);
    const rootServerList = util.getRootSeverList(ns);

    if(!util.doFilesExist(ns, ["home"], filesToCopy)) {
        ns.tprint("=".repeat(20));
        ns.tprint("Error: Essential scripts not found!")
        ns.tprint("=".repeat(20));
        ns.exit();
    }

    if(util.copyPayload(ns, rootServerList, filesToCopy)) {
        ns.tprint("=".repeat(20));
        ns.tprint("Succesfully deployed payload!")
        ns.tprint("=".repeat(20));
    } else {
        ns.tprint("=".repeat(20));
        ns.tprint("Error: copying failed!")
        ns.tprint("=".repeat(20));
        ns.exit();
    }
    //starting setup.js script on each server!
    for(let server of serverList) {
        const availableRam = (ns.getServerRam(server)[0] - ns.getServerRam(server)[1]);
        const maxThreads = Math.floor(availableRam / ns.getScriptRam(scripts.setup));
        ns.exec(scripts.setup, server, maxThreads, target);
    }

}