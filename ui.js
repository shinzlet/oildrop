const geid = document.getElementById.bind(document)

const home = geid("home")

const options = {
	lightToggle: geid("light-toggle"),
	settingsButton: geid("settings-button")
}

const overview = {
	filter: geid("filter"),
	createButton: geid("new-script"),
	scripts: geid("overview"),
	globalPause: geid("global-pause")
}

const editor = {
	wrapper: geid("editor-wrapper")
}

const templates = {
	script: geid("script-card-template").content.children[0]
}

if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
	document.body.classList.add("dark")
}

function setTheme(isLight) {
	document.body.classList.toggle("light", isLight)
	return updateSettings({isLight})
}

getSettings().then(settings => {
	setTheme(settings.isLight)
	options.lightToggle.checked = settings.isLight
})

options.lightToggle.addEventListener("change", e => setTheme(e.target.checked))

// Marks a script as enabled or disabled, saves the change, and tells
// the background script to update userscript registration accordingly.
// script: a script object
// enabled: a boolean
function setScriptActivity(script, enabled) {
	script.enabled = enabled
	action = (enabled ? "" : "un") + "register"

	return saveScript(script)
		.catch(() => alert(`Failed to ${enabled ? "en" : "dis"}able script!`))
		.then(() => browser.runtime.sendMessage({action, script}))
		.catch(() => alert(`Failed to ${action} script!`))
}

function showEditorViaUUID(uuid) {
	return getScript(uuid).then(script => {
		showEditorViaScript(script)
	})
}

function showEditorViaScript(script) {
//	editor.name.value = script.name
//	editor.matches.value = script.matches.join()
//	editor.code.value = script.code
//	editor.type.set(script.type)
//	editor.currentScript = script

	home.classList.add("grayout")
	editor.wrapper.classList.add("active")
}

function showOverview() {
	return new Promise((resolve, reject) => {
		overview.scripts.replaceChildren()
		let url = undefined

		browser.tabs.query({active: true, currentWindow: true}).then(tab => url = tab[0].url)
		.then(() => getAllScripts())
		.then(scripts => filterScripts(scripts, overview.filter.value, url))
		.then(filtered => sortScripts(filtered, url).forEach(script => {
			let el = templates.script.cloneNode(true)
			el.dataset.uuid = script.uuid

			let enable = el.querySelector(".script-enable")
			enable.checked = script.enabled
			enable.addEventListener("click", e => setScriptActivity(script, e.target.checked))

			let name = el.querySelector(".script-name")
			name.innerText = script.name
			name.classList.add(script.type + "-badge")

			el.querySelector(".script-matches").innerText = script.matches
			el.querySelector(".script-date").innerText = script.date.toLocaleDateString()

			el.querySelector(".script-edit").addEventListener("click", () => {
				showEditorViaUUID(script.uuid)
					.catch(() => alert("Failed to open script"))
			})

			el.querySelector(".script-delete").addEventListener("click", () => {
				promptDeletion(script.uuid, script.name)
					.then(showOverview)
					.catch(() => alert("Failed to show overview"))
			})


			overview.scripts.appendChild(el)

			home.classList.remove("grayout")
			// TODO: add this: settings.wrapper.classList.remove("active")
			editor.wrapper.classList.remove("active")
		}))

		resolve()
	})
}

function filterScripts(scripts, method, url) {
	switch(method) {
		case "all": {
			return Object.values(scripts)
		}

		case "active": {
			return Object.values(scripts)
				.filter(script => urlMatches(url, script.matches))
		}
		
		case "inactive": {
			return Object.values(scripts)
				.filter(script => !urlMatches(url, script.matches))
		}
	}
}

function sortScripts(scripts, url) {
	return scripts.sort((a, b) => {
		// Scripts that are active always go first
		let disparity = urlMatches(url, b.matches) - urlMatches(url, a.matches)
		if (disparity != 0) {
			return disparity
		}

		// A disabled script that applies to the local domain has
		// higher priority than an enabled script that isn't for this domain
		disparity = b.enabled - a.enabled
		if (disparity != 0) {
			return disparity
		}

		// If all else is equal, sort alphabetically
		return a.name.localeCompare(b.name)
	})
}

showOverview()

document.querySelectorAll(".dismiss-panels").forEach(el => {
	el.addEventListener("click", showOverview)
})

// saveScript(createScript("the javascript one", true, "google", "js", "window"))
// saveScript(createScript("the css one with a really really really long name!", false, "googlegooglegooglegooglegooglegooglegooglegooglegoogle", "css", "window"))
