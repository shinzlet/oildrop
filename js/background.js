let registrations = {}

function registerScript(script) {
    let uuid = script.uuid
    let code = script.code

    if (registrations[uuid]) {
        unregisterScript(uuid)
    }

    if (script.language == "css") {
        code = `
        (function() {
            let link = document.createElement("link")
            link.setAttribute("rel", "stylesheet")
            link.setAttribute("type", "text/css")
            link.setAttribute("href", "data:text/css;charset=UTF-8,${encodeURIComponent(code)}")
            document.head.appendChild(link)
        })()
        `
    }

    return browser.userScripts.register({
            matches: script.matches,
            js: [{ code }],
            runAt: script.runtime 
        }).then(registration => {
            registrations[uuid] = registration
            resolve()
        })
}

function unregisterScript(uuid) {
    if (registrations[uuid]) {
        registrations[uuid].unregister()
        delete registrations[uuid]
    }
}

// When Oildrop first starts, register scripts that already
// exist.
getAllScripts().then(scripts => {
    for (const uuid in scripts) {
        script = scripts[uuid]

        if (script.enabled) {
            registerScript(script)
        }
    }
})

// Allows the UI to register and unregister scripts.
browser.runtime.onMessage.addListener(message => {
    switch (message.action) {
        case "register":
            if(message.uuid) {
                getScript(message.uuid).then(registerScript)
            } else {
                registerScript(message.script)
            }
            break
        case "unregister":
            unregisterScript(message.uuid || message.script.uuid)
            break
    }
})
