import * as util from "util.js"
/** @param {import(".").NS } ns */

const scripts = {
    "setup": "setup.js",
    "hack": "hack.js",
    "weaken": "weaken.js",
    "grow": "grow.js",
    "cycle": "cycle.js"
};

export async function main(ns) {
    const input = ns.flags([
		['attacker', 'home'],
		['target', ''],
		['steal', 0.91],
        ['ram', 0.80]
	]);
    
    util.tryNukeAllServer(ns);
    const attackStrength = input.steal; //Percentage of money u will steal
    const target = input.target;
	const attacker = input.attacker;
    const filesToCopy = Object.entries(scripts).map(( [k, v] ) =>  v);
    const ramUsageAtacker = input.ram;
    const maxDelayCycle = 1000;
    

    if(!util.doFilesExist(ns, ["home"], filesToCopy)) {
        ns.tprint("=".repeat(20));
        ns.tprint("Error: Essential scripts not found!")
        ns.tprint("=".repeat(20));
        ns.exit();
    }
    
    if(await util.copyPayload(ns, [attacker], filesToCopy)) {
        ns.tprint("=".repeat(20));
        ns.tprint("Succesfully deployed payload!")
        ns.tprint("=".repeat(20));
    } else {
        ns.tprint("=".repeat(20));
        ns.tprint("Error: copying failed!")
        ns.tprint("=".repeat(20));
        ns.exit();
    }
    ns.tprint("running setup for target: " + target);
    //starting setup.js script on each server!
    
    const availableRam = (ns.getServerMaxRam(attacker) - ns.getServerUsedRam(attacker)) * ramUsageAtacker;
    const maxThreads = Math.floor(availableRam / ns.getScriptRam(scripts.setup));
    await ns.exec(scripts.setup, attacker, maxThreads, target);
    

    while(ns.getServerMaxMoney(target) > ns.getServerMoneyAvailable(target)
     || ns.getServerMinSecurityLevel(target) < ns.getServerSecurityLevel(target)) {
        await ns.sleep(1);
    }
    const availableAttackerRam = ns.getServerMaxRam(attacker) - ns.getServerUsedRam(attacker);
    let threadCounts = getScriptThreadCounts(ns, attackStrength, target, availableAttackerRam);

    ns.print("=".repeat(20));
    ns.print("Hack threads: t=" + threadCounts.hackThreads);
    ns.print("Weaken threads: t=" + threadCounts.weakenThreads);
    ns.print("Grow threads: t="+threadCounts.growThreads);
    ns.print("=".repeat(20));

    const maxTime = Math.max(ns.getWeakenTime(target), ns.getHackTime(target), ns.getGrowTime(target))
    let maxCycles = Math.floor(maxTime/maxDelayCycle) - 1;
    while(maxCycles * getRamPerCycle(ns, threadCounts) >= availableAttackerRam * 0.8) {
        maxCycles--;
    }
    ns.tprint("maxTime: "+ maxTime);
    ns.tprint("maxCycles: "+ maxCycles);
    for(let cycle = 0; cycle < maxCycles; cycle++) {
        ns.exec(scripts.cycle, attacker, 1,  attacker, target, input.steal, cycle)
        await ns.sleep(maxDelayCycle);
    }

}

function getScriptThreadCounts(ns, attackStrength, target, attackerRam) {
    let currentThreads = getCycleThreadCounts(ns, attackStrength, target);
    let usedRam = getRamPerCycle(ns, currentThreads);

    while(attackerRam <= usedRam) {
        currentThreads.hackThreads--;
        currentThreads = getCycleThreadCounts(ns, attackStrength, target);
    }
    return currentThreads;
}

function getRamPerCycle(ns, threadCounts) {
   return threadCounts.hackThreads * ns.getScriptRam(scripts.hack) 
            + threadCounts.growThreads * ns.getScriptRam(scripts.grow)
            + threadCounts.weakenThreads * ns.getScriptRam(scripts.weaken);
}

function getCycleThreadCounts(ns, attackStrength, target) {
    const singleThreadMoneyPercent = ns.hackAnalyze(target);
    const weakenConstant = 0.05;

    let currentThreads = {
        "hackThreads": Math.floor(attackStrength / singleThreadMoneyPercent),
        "growThreads": 0,
        "weakenThreads": 0
    }
    const remainingMoney = (1 - attackStrength) * ns.getServerMoneyAvailable(target);
    const growthMultiplierNeeded = Math.ceil(ns.getServerMaxMoney(target) / remainingMoney);
    currentThreads.growThreads = ns.growthAnalyze(target, growthMultiplierNeeded);
    currentThreads.weakenThreads =  (ns.hackAnalyzeSecurity(currentThreads.hackThreads)
                                     + ns.growthAnalyzeSecurity(currentThreads.growThreads)) 
                                      / weakenConstant;
    return currentThreads;
}

function logMoneyAndMinSec(ns, target) {
    ns.print("=".repeat(20));
    ns.print("Maxmoney: "+ ns.getServerMaxMoney(target)
            + " currentMoney: "+ ns.getServerMoneyAvailable(target))
    ns.print(" MinSecurity: "+ ns.getServerMinSecurityLevel(target)
            + " currentSecurity: "+ ns.getServerSecurityLevel(target))
    ns.print("=".repeat(20));
}