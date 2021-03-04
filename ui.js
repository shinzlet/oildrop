let main = document.getElementsByTagName("main")[0]

let homepage = document.getElementById("homepage")
let editor = document.getElementById("editor")
let scriptList = document.getElementById("script-list")

let scriptPreview = document.getElementById("script-preview").content

getAllScripts().then(scripts => {
	scripts.userscripts.forEach(script => {
		console.log(scripts)
		let listItem = scriptPreview.cloneNode(true)
		listItem.querySelector("h3").innerText = script.name

		let h4s = listItem.querySelectorAll("h4")
		h4s[0].innerText = script.matches.toString()
		h4s[1].innerText = script.date.toLocaleDateString()

		listItem.

		scriptList.appendChild(listItem)
	})
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
