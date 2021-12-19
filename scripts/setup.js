/** @param {NS} ns **/
export async function main(ns) {
    const target = ns.args[0];
    while(ns.getServerMoneyAvailable(target) < ns.getServerMaxMoney(target)) {
        await ns.grow(target);
    }
    while(ns.getServerSecurityLevel(target) > ns.getServerMinSecurityLevel(target)) {
        await ns.weaken(target);
    }
}
