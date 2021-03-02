window.addEventListener("load", injectUserScripts)

function injectUserScripts() {
	console.log("injecting userscripts")
}

getAllScripts().then(console.log)
