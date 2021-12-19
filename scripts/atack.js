import * as util from "util.js"
/** @param {NS} ns **/
export async function main(ns) {
    //Auto buy darkweb scripts
    //Auto buy server
    util.tryNukeAllServer(ns);
    const target = util.getBestServer(ns, util.getHackableServers(ns));
    const filesToCopy = [];
   

    if(util.copyPayload(ns, util.getRootSeverList())){
        ns.tprint("=".repeat(20));
        ns.tprint("Succesfully deployed payload!")
        ns.tprint("=".repeat(20));
    } else {
        ns.tprint("Error: copying failed!")
        ns.exit();
    }
}