function createUUID() {
	// Adapted from https://stackoverflow.com/a/2117523
	return ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c =>
		(c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
	);
}

function createScript(name, enabled, matches, type, code) {
	return {name, enabled, matches, type, code, date: new Date(), uuid: createUUID()}
}

function saveScript(script) {
	return new Promise((resolve, reject) => {
		browser.storage.local.set({[script.uuid]: script}).then(resolve).catch(reject)
	})
}

function getAllScripts() {
	return browser.storage.local.get()
}

function getScript(uuid) {
	return browser.storage.local.get(uuid)
}

function splitUrl(url) {
	let schemeSplit = url.indexOf("://")
	let scheme = url.substring(0, schemeSplit)
	let remainder = url.substring(schemeSplit+3)
	let pathSplit = remainder.indexOf("/")
	let host = remainder.substring(0, pathSplit)
	let path = remainder.substring(pathSplit+1)

	return {scheme, host, path}
}

function urlMatches(url, matches) {
	matches.forEach(matchPattern => {
		console.log(splitUrl(matchPattern))
	})
	
	return false
}