import * as util from "util.js"
/** @param {import(".").NS } ns */

export async function main(ns) {
    const input = ns.flags([
		['attacker', 'home'],
		['steal', 0.91],
        ['ram', 0.80]
	]);
    
    util.tryNukeAllServer(ns);
    const target = util.getBestServer(ns, util.getServerList(ns).filter(server => ns.hasRootAccess(server)));
    const script = "attack-one.js"
    ns.exec(script, "home", 1, '--attacker', input.attacker,
             '--target', target, '--steal', input.steal, '--ram', input.ram);
}