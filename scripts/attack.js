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
    util.getServerList(ns).forEach((server) => ns.killall(server));
    util.tryNukeAllServer(ns);
    const target = util.getBestServer(ns, util.getHackableServers(ns));
    const filesToCopy = Object.entries(scripts).map(( [k, v] ) =>  v);
    const botnetList = util.getRootServerList(ns).filter((server) => ns.getServerMaxRam(server) > 0);

    if(!util.doFilesExist(ns, ["home"], filesToCopy)) {
        ns.tprint("=".repeat(20));
        ns.tprint("Error: Essential scripts not found!")
        ns.tprint("=".repeat(20));
        ns.exit();
    }

    if(await util.copyPayload(ns, botnetList, filesToCopy)) {
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
    for(let server of botnetList) {
        const availableRam = (ns.getServerRam(server)[0] - ns.getServerRam(server)[1]);
        const maxThreads = Math.floor(availableRam / ns.getScriptRam(scripts.setup));
        await ns.exec(scripts.setup, server, maxThreads, target);
    }

    while(ns.getServerMaxMoney(target) != ns.getServerMoneyAvailable(target)
     && ns.getServerMinSecurityLevel(target) != ns.getServerSecurityLevel(target)) {
        await ns.sleep(1);
    }
    botnetList.forEach((bot) => ns.killall(bot));

}