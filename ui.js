let error = document.getElementById("error")

document.getElementById("test").addEventListener("click", event => {
	error.innerText = "hi"
	browser.tabs.query({active: true, currentWindow: true}).then(tabs => {
		browser.tabs.sendMessage(tabs[0].id, {
			command: "save_script",
			name: "test",
			content: "content"
		}).then(response => {
			error.innerText = "worked"
		}).catch(error => {
			error.innerText = "didn't work"
		})
		
		error.innerText = "sent"
	})
})
