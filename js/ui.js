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

const editor = (function() {
	lang = geid("editor-language")

	return {
		wrapper: geid("editor-wrapper"),
		name: geid("editor-name"),
		matches: geid("editor-matches"),
		code: geid("editor-code"),
		language: {
			get: () => lang.value,
			set: v => lang.value = v
		},
		saveButton: geid("editor-save")
	}
})()

const settings = {
	wrapper: geid("settings-wrapper"),
	openButton: geid("settings-button"),
	manageButton: geid("manage-data")
}

const templates = {
	script: geid("script-card-template").content.children[0]
}

const snackbar = (function() {
	let elem = geid("snackbar")
	let wrapper = geid("snackbar-wrapper")
	let timer = undefined
	let show = message => {
		geid("snackbar").innerText = message;
		geid("snackbar-wrapper").classList.remove("hidden")

		clearTimeout(timer) // This acts as a debouncer
		timer = window.setTimeout(() => {
			geid("snackbar-wrapper").classList.add("hidden")
		}, 2000)
	}

	return {
		setActivity: state => {
			elem.classList.toggle("inactive", !state)
			if (state) {
				show("Scripts are running")
			} else {
				show("Scripts are paused")
			}
		}
	}
})()

function setTheme(isLight, save) {
	document.body.classList.toggle("light", isLight)
	options.lightToggle.checked = isLight

	if (save) {
		return updateSettings({isLight})
	}
}

// Marks a script as enabled or disabled, saves the change, and tells
// the background script to update userscript registration accordingly.
// script: a script object
// enabled: a boolean
function setScriptActivity(script, enabled) {
	script.enabled = enabled
	action = (enabled ? "" : "un") + "register"

	return saveScript(script)
		.catch(() => alert(`Failed to ${enabled ? "en" : "dis"}able script!`))
		.then(getSettings)
		.then(oildrop => {
			if (oildrop.active) {
				console.log("tried")
				browser.runtime.sendMessage({action, script})
			}
		})
		.catch(() => alert(`Failed to ${action} script!`))
}

function showEditorViaUUID(uuid) {
	return getScript(uuid).then(script => {
		showEditorViaScript(script)
	})
}

function showEditorViaScript(script) {
	editor.name.value = script.name
	editor.matches.value = script.matches.join(", ")
	editor.code.value = script.code
	editor.language.set(script.language)
	editor.currentScript = script

	home.classList.add("grayout")
	editor.wrapper.classList.add("active")
}

function saveEditor() {
	let script = editor.currentScript

	script.code = editor.code.value
	script.name = editor.name.value
	script.matches = editor.matches.value.split(",").map(el => el.trim())
	script.date = new Date().getTime()
	script.language = editor.language.get()

	return saveScript(script).then(() => {
		browser.runtime.sendMessage({action: "register", script})
	})
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
			name.innerText = script.name || "Unnamed Script"
			name.classList.add(script.language + "-badge")

			el.querySelector(".script-matches").innerText = script.matches.join(", ") || "(No domains)"
			el.querySelector(".script-date").innerText = new Date(parseInt(script.date)).toLocaleDateString()
			el.querySelector(".script-edit").addEventListener("click", () => {
				showEditorViaUUID(script.uuid)
					.catch(() => alert("Failed to open script"))
			})

			el.querySelector(".script-delete").addEventListener("click", () => {
				promptDeletion(script.uuid, script.name)
					.catch(() => {}) // Drop the error
					.then(showOverview)
					.catch(() => alert("Failed to show overview"))
			})


			overview.scripts.appendChild(el)

		})).then(() => {
			home.classList.remove("grayout")

			editor.wrapper.classList.remove("active")
			settings.wrapper.classList.remove("active")

			resolve()
		})
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

function promptDeletion(uuid, name) {
	return new Promise((resolve, reject) => {
		if (confirm(`Delete "${name}"?`)) {
			browser.runtime.sendMessage({action: "unregister", uuid}).catch()
			browser.storage.local.remove(uuid)
				.catch(() => alert("Failed to remove script"))
			resolve()
		} else {
			reject()
		}
	})
}

function setGlobalActivity(activity) {
	return getAllScripts().then(scripts => {
		Object.keys(scripts).forEach(uuid => {
			if(scripts[uuid].enabled) {
				let action = (activity ? "" : "un") + "register"
				browser.runtime.sendMessage({action, uuid}).catch()
			}
		})
	})
}

function showSettings() {
	return getSettings().then(oSettings => {
		settings.wrapper.classList.add("active")
		home.classList.add("grayout")
		// TODO
	})
}

function downloadData() {
	browser.storage.local.get().then(data => {
		let file = new Blob([JSON.stringify(data)], {type: "text/plain"})
		let url = URL.createObjectURL(file)
		browser.downloads.download({url, filename: "oildrop.json", saveAs: true})
	})
}

showOverview()

getSettings().then(oSettings => {
	setTheme(oSettings.isLight)
	overview.globalPause.checked = !oSettings.active
	snackbar.setActivity(oSettings.active)
})

options.lightToggle.addEventListener("change", e => setTheme(e.target.checked, true))

document.querySelectorAll(".dismiss-panels").forEach(el => {
	el.addEventListener("click", showOverview)
})

editor.saveButton.addEventListener("click", () => {
	saveEditor()
		.catch(() => alert("Failed to save script"))
		.then(showOverview)
		.catch(() => alert("Failed to return to overview"))
})

settings.openButton.addEventListener("click", () => {
	showSettings()
		.catch(() => alert("Failed to display settings"))
})

settings.manageButton.addEventListener("click", () => {
	browser.tabs.create({url: "/manage.html"})
})

// Allows the user to create a new script
overview.createButton.addEventListener("click", () => {
	showEditorViaScript(createScript("", true, [""], "js", ""))
})

// Reloads the overview when filter option changed
overview.filter.addEventListener("change", () => {
	showOverview()
		.catch(() => alert("Failed to change filter option"))
})

overview.globalPause.addEventListener("change", event => {
	let activity = !event.target.checked
	updateSettings({active: activity})
	snackbar.setActivity(activity)
	setGlobalActivity(activity).catch(() => {
		alert("Failed to set global activity")
	})
})

snackbar.setActivity(!overview.globalPause.checked)
