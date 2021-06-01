const defaultSettings = { isLight: false, active: true }

function createUUID() {
	// Adapted from https://stackoverflow.com/a/2117523
	return ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c =>
		(c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
	);
}

function createScript(name, enabled, matches, language, runtime, code) {
	return {name, enabled, matches, language, runtime, code, date: new Date().getTime(), uuid: createUUID()}
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

function updateSettings(newSettings) {
	return getSettings().then(settings => {
		browser.storage.local.set({"oildrop": Object.assign(settings, newSettings)})
	})
}

function splitUrl(url) {
	const schemeSplit = url.indexOf("://")
	const scheme = url.substring(0, schemeSplit)
	const remainder = url.substring(schemeSplit+3)
	const pathSplit = remainder.indexOf("/")
	const host = remainder.substring(0, pathSplit)
	const path = remainder.substring(pathSplit+1)

	return {scheme, host, path}
}

function urlComponentMatches(source, pattern) {
	// We want to convert something like "*.domain.com" into the regex
	// /^.*\.domain\.com$/i, which will allow us to actually check.
	const toEscape = ".?+^$()[]{}|".split('')
	pattern = toEscape.reduce((str, esc) => str.replaceAll(esc, `\\${esc}`), pattern)
	pattern = pattern.replace("*", ".*")

	return source.match(new RegExp('^' + pattern + '$', "i"))
}

function urlMatches(url, matches) {
	let urlParts = splitUrl(url)

	return matches.some(pattern => {
		let patternParts = splitUrl(pattern)

		return urlComponentMatches(urlParts.scheme, patternParts.scheme)
			&& urlComponentMatches(urlParts.host, patternParts.host)
			&& urlComponentMatches(urlParts.path, patternParts.path)
	})
}
