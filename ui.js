let main = document.getElementsByTagName("main")[0]

let homepage = document.getElementById("homepage")
let editor = document.getElementById("editor")
let scriptList = document.getElementById("script-list")
let errorMessage = document.getElementById("error")

let scriptPreview = document.getElementById("script-preview").content

let editorBody = {
	name: document.getElementById("script-name"),
	code: document.getElementById("script-code"),
	matches: document.getElementById("script-matches"),
	getType: () => document.querySelector("input[name=script-type]:checked").value
}

function onEnableChanged(script, enabled) {
	script.enabled = enabled

	saveScript(script).catch(() => {
		errorMessage.innerText = "Could not save changes!"
	})

	// TODO: send a message to the background script to actually disable / enable the userscript
}

function startEditor(script) {
	homepage.classList.remove("active")
	editor.classList.add("active")
	editor.dataset.uuid = script.uuid

	editorBody.name.value = script.name
	editorBody.code.value = script.code
	editorBody.matches.value = script.matches.join()
	document.querySelector(`input[value=${script.type}]`).checked = true
}

function onSavePressed() {
	return getScript(editor.dataset.uuid).then(res => {
		// Either modify an existing script or create a new one (enabled by default)
		let script = res[editor.dataset.uuid] || {enabled: true}

		script.code = editorBody.code.value
		script.name = editorBody.name.value
		script.matches = editorBody.matches.value.split(",").map(el => el.trim())
		script.date = new Date()
		script.type = editorBody.getType()

		// TODO: error handling
		saveScript(script).then(() => {
			showScripts().then(leaveEditor)
		}).catch()
	})
}

function leaveEditor() {
	editor.classList.remove("active")
	homepage.classList.add("active")
}

function showScripts() {
	scriptList.replaceChildren()

	return getAllScripts().then(scripts => {
		Object.keys(scripts).forEach(uuid => {
			let script = scripts[uuid]
			let listItem = scriptPreview.cloneNode(true).children[0]
	
			let h4s = listItem.querySelectorAll("h4")
			let checkbox = listItem.querySelector("input[type=checkbox]")
			let editButton = listItem.querySelector("button")
	
			listItem.querySelector("h3").innerText = script.name
			h4s[0].innerText = script.matches.toString()
			h4s[1].innerText = script.date.toLocaleDateString()
			checkbox.checked = script.enabled
			listItem.dataset.uuid = uuid
	
			checkbox.addEventListener("click", event => onEnableChanged(script, event.target.checked))
			editButton.addEventListener("click", () => startEditor(script))
	
			scriptList.appendChild(listItem)
		})
	}).catch(err => { errorMessage.innerText = "Error loading scripts" })
}

document.getElementById("debug-button").addEventListener("click", () => browser.tabs.create({url: "ui.html"}))
document.getElementById("leave-editor").addEventListener("click", leaveEditor)
document.getElementById("save").addEventListener("click", onSavePressed)
document.getElementById("create-script").addEventListener("click", () => {
	// Populate the editor fields with dummy values. This will also provide a fresh uuid via createScript.
	startEditor( createScript("", true, [""], "js", "") )
})

showScripts()

// saveScript("foobar", "*", `document.body.style.backgroundColor = "white"`)

// document.getElementById("test").addEventListener("click", event => {
// 	browser.tabs.query({active: true, currentWindow: true}).then(tabs => {
// 		browser.tabs.sendMessage(tabs[0].id, {
// 			command: "save_script",
// 			name: "test",
// 			content: "content"
// 		}).then(response => {
// 			error.innerText = "worked"
// 		}).catch(error => {
// 			error.innerText = "didn't work"
// 		})
// 	})
// })
