let main = document.getElementsByTagName("main")[0]

let homepage = document.getElementById("homepage")
let editor = document.getElementById("editor")
let scriptList = document.getElementById("script-list")
let errorMessage = document.getElementById("error")

let scriptPreview = document.getElementById("script-preview").content

function onEnableChanged(script, enabled) {
	script.enabled = enabled

	saveScript(script).catch(() => {
		errorMessage.innerText = "Could not save changes!"
	})

	// TODO: send a message to the background script to actually disable / enable the userscript
}

function onEditPressed(script) {
	homepage.classList.remove("active")
	editor.classList.add("active")
}

function onLeaveEditorPressed() {
	editor.classList.remove("active")
	homepage.classList.add("active")
}

editor.querySelector("button#leave-editor").addEventListener("click", onLeaveEditorPressed)

getAllScripts().then(scripts => {
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
		editButton.addEventListener("click", () => onEditPressed(script))

		scriptList.appendChild(listItem)
	})
}).catch(err => { errorMessage.innerText = "Error loading scripts" })

document.getElementById("debug-button").addEventListener("click", () => browser.tabs.create({url: "ui.html"}))

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
