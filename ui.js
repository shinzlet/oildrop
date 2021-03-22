const geid = document.getElementById.bind(document)

const global = {
	error: geid("global-error"),
	enable: geid("global-enable")
}

const overview = {
	root: geid("overview"),
	filter: geid("overview-filter"),
	createButton: geid("overview-create-script"),
	scripts: geid("overview-scripts")
}

const editor = {
	root: geid("editor"),
	exitButton: geid("editor-exit"),
	name: geid("editor-name"),
	matches: geid("editor-matches"),
	code: geid("editor-code"),
	type: {
		get: () => { return document.querySelector("input[name=editor-type]:checked").value },
		set: value => { document.querySelector(`input[value=${value}]`).checked = true }
	},
	saveButton: geid("editor-save"),
	deleteButton: geid("editor-delete"),
	currentScript: null
}

const templates = {
	script: geid("template-script-overview").content.children[0]
}

function showEditorViaUUID(uuid) {
	return getScript(uuid).then(script => {
		showEditorViaScript(script)
	})
}

function showEditorViaScript(script) {
	editor.name.value = script.name
	editor.matches.value = script.matches.join()
	editor.code.value = script.code
	editor.type.set(script.type)
	editor.currentScript = script

	overview.root.classList.remove("active")
	editor.root.classList.add("active")
}

function onEnableChanged(script, enabled) {
	script.enabled = enabled

	return saveScript(script).catch(() => {
		global.error.innerText = "Failed to save changes!"
	}).then(() => {
		if (enabled) {
			browser.runtime.sendMessage({action: "register", script})
		} else {
			browser.runtime.sendMessage({action: "unregister", uuid: script.uuid})
		}
	}).catch(() => {
		global.error.innerText = `Failed to ${enabled ? "" : "un"}register script!`
	})
}

async function showOverview() {
	overview.scripts.replaceChildren()
	let url = await browser.tabs.query({active: true, currentWindow: true}).then(tab => tab[0].url)

	return getAllScripts()
		.then(scripts => filterScripts(scripts, overview.filter.value, url))
		.then(filtered => sortScripts(filtered, url).forEach(script => {
			let el = templates.script.cloneNode(true)

			el.querySelector(".overview-name").innerText = script.name
			el.querySelector(".overview-matches").innerText = formatMatches(script.matches)
			el.querySelector(".overview-date").innerText = script.date.toLocaleDateString()
			el.querySelector(".overview-enable").checked = script.enabled
			el.dataset.uuid = script.uuid

			el.querySelector(".overview-edit").addEventListener("click", () => {
				showEditorViaUUID(script.uuid)
					.catch(() => { global.error.innerText = "Failed to open script" })
			})

			el.querySelector(".overview-delete").addEventListener("click", () => {
				promptDeletion(script.uuid, script.name)
					.then(showOverview)
					.catch(() => { global.error.innerText = "Failed to show overview" })
			})

			el.querySelector(".overview-enable").addEventListener("click", event => {
				onEnableChanged(script, event.target.checked)
			})

			overview.scripts.appendChild(el)

			editor.root.classList.remove("active")
			overview.root.classList.add("active")
		}))
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

function saveEditor() {
	let script = editor.currentScript

	script.code = editor.code.value
	script.name = editor.name.value
	script.matches = editor.matches.value.split(",").map(el => el.trim())
	script.date = new Date()
	script.type = editor.type.get()

	return saveScript(script).then(() => {
		browser.runtime.sendMessage({action: "register", script})
	})
}

function promptDeletion(uuid, name) {
	return new Promise((resolve, reject) => {
		if (confirm(`Delete "${name}"?`)) {
			browser.runtime.sendMessage({action: "unregister", uuid}).catch()
			browser.storage.local.remove(uuid)
				.catch(() => { global.error.innerText = "Failed to remove script" })
			resolve()
		} else {
			reject()
		}
	})
}

function formatMatches(matches) {
	return matches.join()
}

// Allows the user to create a new script
overview.createButton.addEventListener("click", () => {
	showEditorViaScript(createScript("", true, [""], "js", ""))
})

// Reloads the overview when filter option changed
overview.filter.addEventListener("change", () => {
	showOverview()
		.catch(() => { global.error.innerText = "Failed to change filter option" })
})

editor.exitButton.addEventListener("click", () => {
	showOverview()
		.catch(() => { global.error.innerText = "Failed to exit editor" })
})

editor.saveButton.addEventListener("click", () => {
	saveEditor()
		.catch(() => { global.error.innerText = "Failed to save script" })
		.then(showOverview)
		.catch(() => { global.error.innerText = "Failed to return to overview" })
		
})

editor.deleteButton.addEventListener("click", () => {
	promptDeletion(editor.currentScript.uuid, editor.name.value)
		.then(showOverview)
		.catch(() => { global.error.innerText = "Failed to return to overview" })
})

showOverview()

// TODO: Debug code - should be removed.
geid("debug-button").addEventListener("click", () => browser.tabs.create({url: "ui.html"}))