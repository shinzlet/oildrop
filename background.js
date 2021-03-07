// Load all saved scripts and register
// Keep track of registered scripts so they can be unregistered
// Allow scripts to be registered/unregistered via the popup (must accept messages)

let registrations = {}

function registerScript(script) {
    return new Promise((resolve, reject) => {
        let uuid = script.uuid
        let code = script.code

        if (registrations[uuid]) {
            unregisterScript(uuid)
        }

        if (script.type == "css") {
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

        browser.userScripts.register({
            matches: script.matches,
            js: [{code}],
            // runAt: "document_start"
        }).then(registration => {
            registrations[uuid] = registration
            resolve()
        })
    })
}

function unregisterScript(uuid) {
    switch (script.type) {
        case "js":
            registrations[uuid].unregister()
            delete registrations[uuid]
            break
        case "css":
            break
    }
}

getAllScripts().then(scripts => {
    for (const uuid in scripts) {
        script = scripts[uuid]

        if (script.enabled) {
            registerScript(script)
        }
    }
})

browser.runtime.onMessage.addListener(message => {
    switch (message.action) {
        case "register":
            registerScript(message.script)
            break
        case "unregister":
            unregisterScript(message.uuid)
            break
    }
})