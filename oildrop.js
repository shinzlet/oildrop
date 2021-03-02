function createScript(name, matches, script) {
	return {name, matches, code, date: new Date()}
}

function saveScript(script, scripts) {
	let userscrips = (scripts + script).sort((a, b) => a.name.localeCompare(b.name))
	browser.storage.set({userscripts})
}

function getAllScripts() {
	return browser.storage.local.get(null)
}

function getMatchingScripts(url) {
	console.log(`checking ${url}`)
}

function retrieveUserScript(name) {
	console.log(`retrieved ${name}`)
}

function deleteUserScript(name) {
	console.log(`deleted ${name}`)
}
