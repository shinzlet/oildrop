// Load all saved scripts and register
// Keep track of registered scripts so they can be unregistered
// Allow scripts to be registered/unregistered via the popup (must accept messages)

let registrations = {}

async function registerScript(script) {
    return new Promise((resolve, reject) => {
        switch (script.type) {
            case "js":
                let uuid = script.uuid

                browser.userScripts.register({
                    matches: script.matches,
                    js: [{code: script.code}],
                    runAt: "document_start"
                }).then(registration => {
                    registrations[uuid] = registration
                    resolve()
                })
                break
            case "css":
                break
        }
    })
}

function unregisterScript(uuid) {
    switch (script.type) {
        case "js":
            console.log(JSON.stringify(registrations))
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