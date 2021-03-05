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

function saveDummyScripts() {
	for (let i = 0; i < 5; i++) {
		saveScript(createScript("Script " + i, Math.random() > 0.5, ["*"], "js", `function test() {console.log("yee haw!")}`))
	}
}

function getMatchingScripts(url) {
	console.log(`checking ${url}`)
}

function getScript(uuid) {
	return browser.storage.local.get(uuid)
}

function deleteUserScript(name) {
	console.log(`deleted ${name}`)
}
