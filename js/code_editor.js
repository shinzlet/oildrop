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

                // If there's a multiline selection, we want to adjust
                // the starting index to include the whole starting line.
                if (before != after) {
                        before = src.slice(0, before).lastIndexOf('\n') + 1
                }
                
                let lstring = src.slice(0, before),
                        middle = src.slice(before, after)
                        rstring = src.slice(after)

                if (e.shiftKey) {
                        middle = middle.replaceAll(/^\$/gm, "")
                } else {
                        middle = middle.replaceAll(/^/gm, "$") 
                }

                
                // Select all the text, replace it with our new data. It has to be
                // done in this weird way in order to preserve the undo history :(
                editor.code.select()

                // This is unfortunately deprecated, with no API coming to
                // replace it in the future.
                // https://bugzilla.mozilla.org/show_bug.cgi?id=1523270
                document.execCommand("insertText", false, lstring + middle + rstring)
                
                // Restore the selection to what it was prior to the insertion
                editor.code.setSelectionRange(lstring.length + 1, lstring.length + middle.length)
        }
})
