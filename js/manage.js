const loadButton = document.getElementById("copy-scripts")
const overwriteButton = document.getElementById("overwrite")
const exportButton = document.getElementById("export")
const picker = document.getElementById("file-picker")

function updateTheme() {
    getSettings().then(oSettings => {
            document.body.classList.toggle("light", oSettings.isLight)
    })
}

function downloadData() {
	browser.storage.local.get().then(data => {
		let file = new Blob([JSON.stringify(data)], {type: "text/plain"})
		let url = URL.createObjectURL(file)
		browser.downloads.download({url, filename: "oildrop.json", saveAs: true})
	})
}


function getData() {
    return picker.files[0].text().then(JSON.parse)
}

function loadScripts() {
    if (confirm("Loading configuration that you do not absolutely trust will compromise the security of your personal information. Press 'OK' if you still want to continue.")) {
        getData().then(data => {
            const sources = data.scripts || data || {}
            delete sources.oildrop // Get rid of the settings object
            Object.values(sources).forEach(s => {
                if (s.name || s.matches || s.language || s.code) {
                    saveScript(createScript(s.name, false, s.matches, s.language, s.code))
                }
            })
        })
    }
}

function overwriteConfig() {
    if (confirm("Overwriting your configuration will permanently delete your current scripts and settings. Additionally, loading configuration that you do not absolutely trust will compromise the security of your personal information. Press 'OK' if you still want to continue.")) {
        getData().then(data => {
            browser.storage.local.clear()
                .then(() => {
                    browser.storage.local.set(data)
                })
        })
    }
}

picker.addEventListener("change", () => {
    let hasFile = picker.files.length > 0

    loadButton.disabled = !hasFile
    overwrite.disabled = !hasFile
})

loadButton.addEventListener("click", loadScripts)
overwriteButton.addEventListener("click", overwriteConfig)
exportButton.addEventListener("click", downloadData)

window.setInterval(updateTheme, 500)
updateTheme()
