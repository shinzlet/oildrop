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

const snackbar = (function() {
	let elem = geid("snackbar")
	let wrapper = geid("snackbar-wrapper")
	let timer = undefined
	let show = message => {
		geid("snackbar").innerText = message;
		geid("snackbar-wrapper").classList.remove("hidden")

		clearTimeout(timer) // This acts as a debouncer
		timer = window.setTimeout(() => {
			wrapper.classList.add("hidden")
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

const editor = (function() {
	function select(id) {
		const el = geid(id)
		return {
			get: () => el.value,
			set: v => el.value = v
		}
	}

	return {
		wrapper: geid("editor-wrapper"),
		name: geid("editor-name"),
		matches: geid("editor-matches"),
		code: geid("editor-code"),
		language: select("editor-language"),
		runtime: select("editor-runtime"),
		saveButton: geid("editor-save"),
		// Using a default of false allows the visually impaired to still edit scripts if settings fail to load.
		enableIndent: false
	}
})()

const settings = {
	wrapper: geid("settings-wrapper"),
	openButton: geid("settings-button"),
	manageButton: geid("manage-data"),
	newTabButton: geid("open-in-tab")
}

const templates = {
	script: geid("script-card-template").content.children[0]
}

// Sets the theme that oildrop uses.
// isLight: true if light theme should be used, false for dark theme
// save: true if you want to save this change in the addon settings
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
	return getScript(uuid).then(showEditorViaScript)
}

function showEditorViaScript(script) {
	editor.name.value = script.name
	editor.matches.value = script.matches.join(", ")
	editor.code.value = script.code
	editor.language.set(script.language)
	editor.runtime.set(script.runtime)
	editor.currentScript = script

	home.classList.add("grayout")
	editor.wrapper.classList.add("active")
}

// Saves the data from the editor into a script object, and re-registers
// it if the script is enabled.
function saveEditor() {
	let script = editor.currentScript

	script.code = editor.code.value
	script.name = editor.name.value
	script.matches = editor.matches.value.split(",").map(el => el.trim())
	script.date = new Date().getTime()
	script.language = editor.language.get()
	script.runtime = editor.runtime.get()

	return saveScript(script).then(() => {
		if (script.enabled) {
			browser.runtime.sendMessage({action: "register", script})
		}
	})
}

// Copies the script template, populates it with script data, and adds
// the new element to the overview panel.
// script: The script (see createScript in oildrop.js) to use
function addScriptToOverview(script) {
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
			.finally(showOverview)
	})

	overview.scripts.appendChild(el)
}

// Brings the overview panel into focus by dismissing all panels and
// disabling the grayout.
function hidePanels() {
	home.classList.remove("grayout")
	editor.wrapper.classList.remove("active")
	settings.wrapper.classList.remove("active")
}

// Populates the overview with appropriate scripts depending on filter settings.
function populateOverview() {
	let url = undefined

	return browser.tabs.query({active: true, currentWindow: true}).then(tab => url = tab[0].url)
		.then(getAllScripts)
		.then(scripts => filterScripts(Object.values(scripts), overview.filter.value, url))
		.then(filtered => sortScripts(filtered, url).forEach(addScriptToOverview))
}

// Populates the overview with appropriate scripts and brings it into focus.
function showOverview() {
	overview.scripts.replaceChildren()

	return populateOverview().then(hidePanels)
		.catch(() => alert("Failed to show overview"))
}

// Applies a filter setting to a list of scripts, using a provided url for discrimination.
// scripts: an array of script objects (see createScript in oildrop.js)
// method: one of "all", "active", or "inactive". "all" leaves the scripts unmodified,
// 	 	"active" returns only those which match the provided url, and "inactive"
// 	 	returns only the scripts that do not match the provided url
// url: the url used for the "active" and "inactive" methods
function filterScripts(scripts, method, url) {
	switch(method) {
		case "all": {
			return scripts
		}

		case "active": {
			return scripts.filter(script => urlMatches(url, script.matches))
		}
		
		case "inactive": {
			return scripts.filter(script => !urlMatches(url, script.matches))
		}
	}
}

// Sorts the provided script objects based on several criteria, ultimately putting
// them in the most useful order for the user.
// scripts: An array of script objects (see createScript in oildrop.js)
// url: the url that should be used to sort and prioritize scripts
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

// Prompts the user to delete a script, returning a promsise that encodes wether they
// chose to or wether they cancelled the operation.
// uuid: the uuid of the script object to delete
// name: a name that represents the script you're prompting deletion of
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

// Changes wether Oildrop (as an extension, not as a set of scripts) is active. By
// calling `setGlobalActivity(false)`, oildrop will be fully disabled until global
// activity is restored. This corresponds to the pause button in Oildrop's UI.
// activity: true if oildrop should be enabled, false if it should be disabled
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

// Shows the settings panel, hiding other panels and enabling grayout on the overview.
function showSettings() {
	return getSettings().then(oSettings => {
		editor.wrapper.classList.remove("active")
		settings.wrapper.classList.add("active")
		home.classList.add("grayout")
	})
}

// Binds Oildrop's UI controls to the various functions they represent.
// This function should be called only once at the start of the UI loading sequence.
function bindListeners() {
	// Applies the user light theme setting and saves it
	options.lightToggle.addEventListener("change", e => setTheme(e.target.checked, true))

	// Allows the user to create a new script
	overview.createButton.addEventListener("click", () => {
		browser.tabs.query({active: true, currentWindow: true})
			.then(tab => {
				showEditorViaScript(createScript("", true, [""], "js", "document_idle", ""))
				editor.matches.value = tab[0].url.split('#')[0]
			})
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

	settings.newTabButton.addEventListener("click", () => {
		browser.tabs.create({url: "/ui.html"})
	})

	document.querySelectorAll(".dismiss-panels").forEach(el => {
		el.addEventListener("click", showOverview)
	})
}

// Load and apply oildrop's settings
getSettings().then(oSettings => {
	setTheme(oSettings.isLight)
	overview.globalPause.checked = !oSettings.active
	snackbar.setActivity(oSettings.active)
	editor.enableIndent = oSettings.enableIndent
})

bindListeners()
showOverview()
