/** @param {NS} ns **/

export async function main(ns) {
	let server = getServerList(ns);
	ns.tprint(server.length)
	//server.forEach(item => ns.tprint(item));
    ns.tprint(getBestServer(ns, getHackableServers(ns)));
    
}
export function getServerList(ns) {
	return recursiveServerList([], "home", ns).sort();
}

function recursiveServerList(currentServerList, currentHostname, ns){
	var hostnames = ns.scan(currentHostname);
	var newServerList = currentServerList;
	const forbiddenServer = ["home", "darkweb"];

	hostnames.forEach(function (hostname){
		if(!currentServerList.includes(hostname) && !forbiddenServer.includes(hostname)) {
			newServerList.push(hostname);
			newServerList.concat(recursiveServerList(newServerList, hostname, ns));
		}
	});
	return newServerList;
}

export function getServerScore(ns, hostname) {
	let maxMoney = ns.getServerMaxMoney(hostname);
	return maxMoney * ns.getServerGrowth(hostname)
		+ maxMoney * ns.hackAnalyzeChance(hostname)
		+ maxMoney / ns.getServerMinSecurityLevel(hostname)
		+ maxMoney / ns.getHackTime(hostname);
}

export function getBestServer(ns, hostnames, timeThreshold=300000) {
	let servers = hostnames.sort((a, b) => getServerScore(ns, b) - getServerScore(ns, a));
    for(let server of servers) {
        if(ns.getWeakenTime(server) < timeThreshold)
            return server;
    }
    let weakenTime = servers.map(server => ns.getWeakenTime(server));
    return servers[weakenTime.indexOf(Math.min(...weakenTime))];
}

export function doFilesExist(ns, serverList, files) {
    let exist = true;
    for(let server of serverList) {
        for(let file of files) {
            exist = exist && ns.fileExists(file, server);
        }
    }
    return exist;
}

export function copyPayload(ns, serverList, src="home", files) {
    let success = true;
    for(let server of serverList) {
        for(let file of files) {
            success = succes && ns.scp(file, src, server);
        }
    }
    return success;
}

export function tryNukeAllServer(ns) {
	const servers = getServerList(ns).filter(function (host) {
        return getPortsAvailable(ns) >= ns.getServerNumPortsRequired(host);
    });
    for(let server of servers) {
        if(!ns.hasRootAccess(server))
            openPorts(ns, server);
    }
}

export function getRootServerList(ns) {
    return getServerList(ns).filter(server => ns.hasRootAccess(server));
}

export function getHackableServers(ns){
    return getServerList(ns)
     .filter(server => ns.getServerRequiredHackingLevel(server) <= ns.getHackingLevel());
}

export function getPortsAvailable(ns) {
    return ns.fileExists("BruteSSH.exe", "home")
        + ns.fileExists("FTPCrack.exe", "home")
        + ns.fileExists("RelaySMTP.exe", "home")
        + ns.fileExists("HTTPWorm.exe", "home")
        + ns.fileExists("SQLInject.exe", "home");
}

export function openPorts(ns, hostname) {
    switch (ns.getServerNumPortsRequired(hostname)) {
        case 1:
            ns.brutessh(hostname);
            break;
        case 2:
            ns.brutessh(hostname);
            ns.ftpcrack(hostname);
            break;
        case 3:
            ns.brutessh(hostname);
            ns.ftpcrack(hostname);
            ns.relaysmtp(hostname)
            break;
        case 4:
            ns.brutessh(hostname);
            ns.ftpcrack(hostname);
            ns.relaysmtp(hostname);
            ns.httpworm(hostname);
            break;
        case 5:
            ns.brutessh(hostname);
            ns.ftpcrack(hostname);
            ns.relaysmtp(hostname);
            ns.httpworm(hostname);
            ns.sqlinject(hostname);
            break;
    }
}