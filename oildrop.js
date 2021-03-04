function createUUID() {
	// Adapted from https://stackoverflow.com/a/2117523
	return ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c =>
		(c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
	);
}

function createScript(name, matches, code) {
	return {name, matches, code, date: new Date(), uuid: createUUID()}
}

function saveScript(script) {
	return new Promise((resolve, reject) => {
		getAllScripts().then(res => {
			userscripts = res.userscripts || {}
			userscripts[script.uuid] = script
			browser.storage.local.set({userscripts})
		})
	})
}

function getAllScripts() {
	return browser.storage.local.get("userscripts")
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
