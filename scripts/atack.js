import * as util from "util.js"
/** @param {NS} ns **/
export async function main(ns) {
    //Auto buy darkweb scripts
    //Auto buy server
    util.tryNukeAllServer(ns);
    const target = util.getBestServer(ns, util.getHackableServers(ns));
    const filesToCopy = ["setup.js", "hack.js", "weaken.js", "grow.js"];

    if(!util.doFilesExist(ns, ["home"], filesToCopy)) {
        ns.tprint("=".repeat(20));
        ns.tprint("Error: Essential scripts not found!")
        ns.tprint("=".repeat(20));
        ns.exit();
    }

    if(util.copyPayload(ns, util.getRootSeverList(ns), filesToCopy)) {
        ns.tprint("=".repeat(20));
        ns.tprint("Succesfully deployed payload!")
        ns.tprint("=".repeat(20));
    } else {
        ns.tprint("=".repeat(20));
        ns.tprint("Error: copying failed!")
        ns.tprint("=".repeat(20));
        ns.exit();
    }
}