let main = document.getElementsByTagName("main")[0]

let homepage = document.getElementById("homepage")
let editor = document.getElementById("editor")
let scriptList = document.getElementById("script-list")
let errorMessage = document.getElementById("error")

let scriptPreview = document.getElementById("script-preview").content

getAllScripts().then(scripts => {
	Object.keys(scripts).forEach(uuid => {
		let script = scripts[uuid]
		let listItem = scriptPreview.cloneNode(true).children[0]

		listItem.querySelector("h3").innerText = script.name

		let h4s = listItem.querySelectorAll("h4")
		h4s[0].innerText = script.matches.toString()
		h4s[1].innerText = script.date.toLocaleDateString()

		listItem.querySelector("input[type=checkbox]").checked = script.enabled

		listItem.dataset.uuid = uuid

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
