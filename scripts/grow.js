/** @param {import(".").NS } ns */
export async function main(ns) {
    await ns.grow(ns.args[0]);  
    ns.tprint("grow: done!");
}