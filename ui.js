let main = document.getElementsByTagName("main")[0]

let homepage = document.getElementById("homepage")
let editor = document.getElementById("editor")
let scriptList = document.getElementById("script-list")

let scriptPreview = document.getElementById("script-preview").content

// for(let i = 0; i < 10; i++) {
// 	scriptList.appendChild(scriptPreview.cloneNode(true))
// }

getAllScripts().then(scripts => {
	for (const scriptName in scripts) {
		let listItem = scriptPreview.cloneNode(true)
		listItem.querySelector("h4").innerText = scriptName

		let h3s = listItem.querySelectorAll("h4")
		h3s[0].innerText = scripts[scriptName].url
		h3s[1].innerText = scripts[scriptName].date.toLocaleDateString()

		scriptList.appendChild(listItem)
	}
})

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
