/** @param {import(".").NS } ns */
const scripts = {
    "hack": "hack.js",
    "weaken": "weaken.js",
    "grow": "grow.js",
};

export async function main(ns) {
    const attacker = ns.args[0];
	const target = ns.args[1];
	const attackStrength = ns.args[2];
    const id = ns.args[3];
    const timeHackBuffer = 100;
    const timeGrowBuffer = 50;

    let firstSleep = 0;
    let secondSleep = 0;
    let weakenTime = 0;
    let threadCounts;
    while(true) {
        logMoneyAndMinSec(ns, target);
        threadCounts = getScriptThreadCounts(ns, attackStrength, target, attacker);

        weakenTime = ns.getWeakenTime(target, ns.getHackingLevel());
        firstSleep = weakenTime -  ns.getGrowTime(target);
        secondSleep = (weakenTime - ns.getHackTime(target)) - firstSleep;
        
        ns.exec(scripts.weaken, attacker, threadCounts.weakenThreads, target, id);

        await ns.sleep(firstSleep - timeGrowBuffer);
        ns.exec(scripts.grow, attacker, threadCounts.growThreads, target, id);
        
        await ns.sleep(secondSleep - timeHackBuffer);
        ns.exec(scripts.hack, attacker, threadCounts.hackThreads, target, id);
        
        await ns.sleep(ns.getHackTime(target));
    }
}

function getScriptThreadCounts(ns, attackStrength, target, attacker) {
    const attackerRam = ns.getServerMaxRam(attacker) - ns.getServerUsedRam(attacker);
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