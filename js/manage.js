const loadButton = document.getElementById("copy-scripts")
const overwriteButton = document.getElementById("overwrite")
const exportButton = document.getElementById("export")
const picker = document.getElementById("file-picker")

// Ensures that this page's theme matches that being used in oildrop's settings.
function updateTheme() {
    getSettings().then(oSettings => {
            document.body.classList.toggle("light", oSettings.isLight)
    })
}

// Saves Oildrop's settings to a file on disk.
function downloadData() {
	browser.storage.local.get().then(data => {
		let file = new Blob([JSON.stringify(data)], {type: "text/plain"})
		let url = URL.createObjectURL(file)
		browser.downloads.download({url, filename: "oildrop.json", saveAs: true})
	})
}

// Loads the file from the picker and returns a JSON object with its contents.
function getData() {
    return picker.files[0].text().then(JSON.parse)
}

// Loads just the script data from the file in the picker, keeping Oildrop's settings and existing
// scripts in-tact.
function loadScripts() {
    if (confirm("Loading configuration that you do not absolutely trust will compromise the security of your personal information. Press 'OK' if you still want to continue.")) {
        getData().then(data => {
            const sources = data.scripts || data || {}
            delete sources.oildrop // Get rid of the settings object
            Object.values(sources).forEach(s => {
                if (s.name || s.matches || s.language || s.code || s.runtime) {
                    saveScript(createScript(s.name, false, s.matches, s.language, s.runtime, s.code))
                }
            })
        })
    }
}

// Deletes all Oildrop data, and restores from the file in the picker.
function overwriteConfig() {
    if (confirm("Overwriting your configuration will permanently delete your current scripts and settings. Additionally, loading configuration that you do not absolutely trust will compromise the security of your personal information. Press 'OK' if you still want to continue.")) {
        getData().then(data => {
            getAllScripts()
                .then(Object.values)
                .then(scripts => {
                    scripts.forEach(script => {
                        if (script.enabled) {
                            browser.runtime.sendMessage({action: "unregister", script})
                        }
                    })
                })

            browser.storage.local.clear()
                .then(() => browser.storage.local.set(data))
                .then(getAllScripts)
                .then(Object.values)
                .then(scripts => {
                    scripts.forEach(script => {
                        if (script.enabled) {
                            browser.runtime.sendMessage({action: "register", script})
                        }
                    })
                })
        })
    }
}

// Ensure that the load / overwrite buttons are only clickable when you have a file selected.
picker.addEventListener("change", () => {
    let hasFile = picker.files.length > 0

    loadButton.disabled = !hasFile
    overwrite.disabled = !hasFile
})

loadButton.addEventListener("click", loadScripts)
overwriteButton.addEventListener("click", overwriteConfig)
exportButton.addEventListener("click", downloadData)

// Ensure that the correct theme is used even if the user changes it via the popup.
window.setInterval(updateTheme, 500)
updateTheme()
