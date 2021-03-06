// Load all saved scripts and register
// Keep track of registered scripts so they can be unregistered
// Allow scripts to be registered/unregistered via the popup (must accept messages)

let registrations = {}

function registerScript(script) {
    return Promise.new((resolve, reject) => {
        switch (script.type) {
            case "js":
                uuid = script.uuid

                if (registrations[uuid]) {
                    reject("A script with this UUID was already registered!")
                }

                registrations[uuid] = browser.userScripts.register({
                    matches: script.matches,
                    js: script.code,
                    runAt: "document_start"
                })

                resolve()
                break;
            case "css":
                break;
        }
    })
}

function unregisterScript(uuid) {
    switch (script.type) {
        case "js":
            registrations[uuid].unregister()
            delete registrations[uuid]
            break;
        case "css":
            break;
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