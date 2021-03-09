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

function showOverview() {
	return new Promise((resolve, reject) => {
		overview.scripts.replaceChildren()

		getAllScripts().then(scripts => {
			scripts = Object.values(scripts).sort((a, b) => {
				let na = a.name.toLowerCase(),
					nb = b.name.toLowerCase();
			
				if (na < nb) {
					return -1;
				}
				if (na > nb) {
					return 1;
				}
				return 0;
			});

			scripts.forEach(script => {
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
				})

				overview.scripts.appendChild(el)
			})

			editor.root.classList.remove("active")
			overview.root.classList.add("active")

			resolve()
		}).catch(reject)
	})
}

function saveEditor() {
	let script = editor.currentScript

	script.code = editor.code.value
	script.name = editor.name.value
	script.matches = editor.matches.value.split(",").map(el => el.trim())
	script.date = new Date()
	script.type = editor.type.get()

	return saveScript(script)
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

// TODO: Debug code - should be removed.
geid("debug-button").addEventListener("click", () => browser.tabs.create({url: "ui.html"}))

overview.createButton.addEventListener("click", () => {
	// Create new script
	showEditorViaScript(createScript("", true, [""], "js", ""))
})

editor.exitButton.addEventListener("click", () => {
	showOverview()
		.catch(() => { global.error.innerText = "Failed to show overview" })
})

editor.saveButton.addEventListener("click", () => {
	saveEditor()
		.catch(() => { global.error.innerText = "Failed to save script" })
		.then(showOverview)
		.catch(() => { global.error.innerText = "Failed to show overview" })
		
})

editor.deleteButton.addEventListener("click", () => {
	promptDeletion(editor.currentScript.uuid, editor.name.value)
		.then(showOverview)
		.catch(() => { global.error.innerText = "Failed to show overview" })
})

showOverview()