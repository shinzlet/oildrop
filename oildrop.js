document.body.style.border = "5px solid blue";

browser.runtime.onMessage.addListener(message => {
	console.log(message)
})

function getMatchingScripts(url) {
	console.log(`checking ${url}`)
}

function saveUserScript(script, name) {
	console.log(`saved ${script} as ${name}`)
}

function retrieveUserScript(name) {
	console.log(`retrieved ${name}`)
}

function deleteUserScript(name) {
	console.log(`deleted ${name}`)
}
