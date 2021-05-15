const defaultSettings = { isLight: false }

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
	return browser.storage.local.set({[script.uuid]: script})
}

function getAllScripts() {
	return browser.storage.local.get().then(data => {
		delete data["oildrop"] // Remove the settings object
		return data
	})
}

function getScript(uuid) {
	return browser.storage.local.get(uuid).then(res => res[uuid])
}

function getSettings() {
	return browser.storage.local.get("oildrop").then(data => data.oildrop || defaultSettings)
}

function updateSettings(new_settings) {
	return getSettings().then(settings => {
		browser.storage.local.set({"oildrop": Object.assign(settings, new_settings)})
	})
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

function urlComponentMatches(source, pattern) {
	// We want to convert something like "*.domain.com" into the regex
	// /^.*\.domain\.com$/i, which will allow us to actually check.
	let re = new RegExp(`^${pattern.replace(".", "\\.").replace("*", ".*")}$`, "i")
	return source.match(re)
}

function urlMatches(url, matches) {
	let urlParts = splitUrl(url)

	for (pattern of matches) {
		let patternParts = splitUrl(pattern)

		if (urlComponentMatches(urlParts.scheme, patternParts.scheme)
			&& urlComponentMatches(urlParts.host, patternParts.host)
			&& urlComponentMatches(urlParts.path, patternParts.path)) {
			
			return true
		}
	}
	
	return false
}