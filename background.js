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
            js: [{ code }],
            // runAt: "document_start"
        }).then(registration => {
            registrations[uuid] = registration
            resolve()
        })
    })
}

function unregisterScript(uuid) {
    if (registrations[uuid]) {
        registrations[uuid].unregister()
        delete registrations[uuid]
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
        case "debug":
            console.log(registrations)
            break
    }
})