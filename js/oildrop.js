const defaultSettings = { isLight: false, active: true }

function createUUID() {
	// Adapted from https://stackoverflow.com/a/2117523
	return ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c =>
		(c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
	);
}

// Creates and returns a script object - the data structure representing a userscript / userstyle.
// name: The display name associated with this script
// 	It it never used internally, so it doesn't need to be unique or even alphanumeric
// enabled: True if the script should run on pages it matches, false if it should be temporarily diabled
// matches: An array of wildcard-strings that match URLs. They must be in
// 	<scheme>://<host>/<path> format as per mozilla's userscript API
// language: Either "css" or "js"
// runtime: When the script should be run. Can be any string that matches userScript.register's
// 	`runAt` key: https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/userScripts/register
// code: A string containing the script's javascript or css content
function createScript(name, enabled, matches, language, runtime, code) {
	return {name, enabled, matches, language, runtime, code, date: new Date().getTime(), uuid: createUUID()}
}

// Saves a script object to Oildrop's local storage.
function saveScript(script) {
	return browser.storage.local.set({[script.uuid]: script})
}

// Returns a promise-wrapped object mapping uuids to their script objects.
function getAllScripts() {
	return browser.storage.local.get().then(data => {
		delete data["oildrop"] // Remove the settings object
		return data
	})
}

// Returns a promise-wrapped script that corresponds to the uuid passed.
// uuid: The interal uuid that the script is saved under
function getScript(uuid) {
	return browser.storage.local.get(uuid).then(res => res[uuid])
}

// Returns Oildrop's saved settings (or the default settings if unavailable),
// wrapped in a promise.
function getSettings() {
	return browser.storage.local.get("oildrop").then(data => data.oildrop || defaultSettings)
}

// Merges the `newSettings` object with Oildrop's existing settings, then saves them to disk.
// This is useful for updating individual settings, or all of them at once - it will not
// efffect settings you don't provide as keys.
// newSettings: An object mapping setting names to their new values.
function updateSettings(newSettings) {
	return getSettings().then(settings => {
		browser.storage.local.set({"oildrop": Object.assign(settings, newSettings)})
	})
}

// Splits the provided URL into a scheme, host, and path as per the userScript API.
function splitUrl(url) {
	const schemeSplit = url.indexOf("://")
	const scheme = url.substring(0, schemeSplit)
	const remainder = url.substring(schemeSplit+3)
	const pathSplit = remainder.indexOf("/")
	const host = remainder.substring(0, pathSplit)
	const path = remainder.substring(pathSplit+1)

	return {scheme, host, path}
}

// Returns true if the pattern (which may be a glob string containing *, the wildcard)
// matches the source. This method uses Regex internally, so an engineered input using
// invalud url characters could make it return true at the wrong time. However, this is
// currently only used for displaying what scripts are running, and has no effect on what scripts
// will actually be run.
function urlComponentMatches(source, pattern) {
	// We want to convert something like "*.domain.com" into the regex
	// /^.*\.domain\.com$/i, which will allow us to actually check.
	const toEscape = ".?+^$()[]{}|".split('')
	pattern = toEscape.reduce((str, esc) => str.replaceAll(esc, `\\${esc}`), pattern)
	pattern = pattern.replace("*", ".*")

	return source.match(new RegExp('^' + pattern + '$', "i"))
}

// Returns true if the url is matched by any of the glob patterns in `matches`.
// url: a URl to check for matches
// matches: An array of glob strings (URLs that can include *,
// 	the n-character wildcard) to match against)
function urlMatches(url, matches) {
	let urlParts = splitUrl(url)

	return matches.some(pattern => {
		let patternParts = splitUrl(pattern)

		return urlComponentMatches(urlParts.scheme, patternParts.scheme)
			&& urlComponentMatches(urlParts.host, patternParts.host)
			&& urlComponentMatches(urlParts.path, patternParts.path)
	})
}
