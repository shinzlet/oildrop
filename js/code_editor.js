// By default, tab-indenting doesn't work in textareas. We have to fix it
// in javascript, because this is a really fundamental code editing feature.
editor.code.addEventListener("keydown", e => {
        if (!editor.enableIndent) {
                return
        }

        if (e.key == "Tab") {
                e.preventDefault()

                let src = editor.code.value

                let start = editor.code.selectionStart,
                        end = editor.code.selectionEnd

                // start and end aren't actually ordered -
                // we need them to be increasing.
                let before = Math.min(start, end),
                        after = Math.max(start, end)

                let lstring = src.slice(0, before),
                        middle = src.slice(before, after)
                        rstring = src.slice(after)
                
                if (e.shiftKey) {
                        middle = middle.replaceAll(/^\t/gm, "")
                } else {
                        middle = middle.replaceAll(/^/gm, "\t") 
                }

                editor.code.value = lstring + middle + rstring
        }
})
