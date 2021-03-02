function saveScript(name, url, script) {
	browser.storage.local.set({
		[name]: {url, script, date: new Date()}
	})
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
