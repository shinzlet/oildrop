const geid = document.getElementById.bind(document)

geid("foo").addEventListener("click", () => {
    geid("editor-wrapper").classList.toggle("visible")
    document.querySelector("main").classList.toggle("obscured")
})

geid("bar").addEventListener("click", () => {
    geid("settings-wrapper").classList.toggle("visible")
    document.querySelector("main").classList.toggle("obscured")
})
