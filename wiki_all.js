var base_wiki_url = "https://www.wikiwand.com"
window.onload = function () {
    document.getElementById('list_all').addEventListener('click', list_all, false)
    document.getElementById('net_work').addEventListener('click', net_work, false)
    document.getElementById('show_notes').addEventListener('click', show_notes, false)
    document.getElementById('show_figs').addEventListener('click', show_figs, false)
    document.getElementById('upload_file').addEventListener('click', upload_file, false)
    document.getElementById('export_file').addEventListener('click', export_file, false)
    list_all()
    // todo: add some review functions, randomized list
}

function net_work() {}

function show_notes() {
    chrome.storage.local.get(["collected_list"], function (res) {
        if (res.collected_list.length > 0) {
            var nothing_text = [...document.getElementsByClassName("nothing_text")]
            nothing_text.forEach(e => {
                e.parentNode.removeChild(e)
            })
            clear_content()
        }
        res.collected_list.forEach(url => {
            var collected_div = document.getElementById("article_container")
            chrome.storage.local.get([url], function (res) {
                var title = get_title(res[url], url)
                var notes = get_notes(res[url], url, true)
                var highlight = get_highlight(res[url], url, true)
                var entry_div = document.createElement('div')
                entry_div.classList.add("container-fluid")
                entry_div.classList.add("wiki_content")
                if (notes != null || highlight != null) {
                    entry_div.appendChild(title)
                    if (notes != null) entry_div.appendChild(notes)
                    if (highlight != null) entry_div.appendChild(highlight)
                    entry_div.appendChild(document.createElement("hr"))
                }
                collected_div.appendChild(entry_div)
            })
        })
    })
}

function show_figs() {
    // todo: switch between gallery layout
    chrome.storage.local.get(["collected_list"], function (res) {
        if (res.collected_list.length > 0) {
            var nothing_text = [...document.getElementsByClassName("nothing_text")]
            nothing_text.forEach(e => {
                e.parentNode.removeChild(e)
            })
            clear_content()
        }
        var collected_div = document.getElementById("article_container")
        var gallery = document.createElement("div")
        gallery.classList.add("d-flex")
        gallery.classList.add("flex-wrap")
        gallery.classList.add("p-2")
        gallery.classList.add("wiki_content")

        res.collected_list.forEach(url => {
            chrome.storage.local.get([url], function (res) {
                res[url].saved_fig.forEach(f => {
                    var img_div = document.createElement("div")
                    img_div.setAttribute("style", "width:auto;text-align:center;")
                    var img = document.createElement("img")
                    img.src = f.src
                    img.addEventListener('click', open_img, false)
                    img_div.appendChild(img)
                    var width_height = "width:auto;height:200px;"
                    if (f.title[0] == "(" || f.title[0] == "{") {
                        width_height = "width:auto;height:50px;"
                    }
                    img.setAttribute("style", width_height + "cursor:pointer;")
                    img.classList.add("rounded")
                    img_div.classList.add("p-2")
                    gallery.appendChild(img_div)
                })
            })
            collected_div.appendChild(gallery)
        })
    })
}

function clear_content() {
    var content = [...document.getElementsByClassName("wiki_content")]
    content.forEach(c => {
        c.parentNode.removeChild(c)
    })
}

function list_all() {
    chrome.storage.local.get(["collected_list"], function (res) {
        if (res.collected_list.length > 0) {
            var nothing_text = [...document.getElementsByClassName("nothing_text")]
            nothing_text.forEach(e => {
                e.parentNode.removeChild(e)
            })
            clear_content()
        }
        res.collected_list.forEach(url => {
            var nav_list = document.getElementById("collected_list")
            var collected_div = document.getElementById("article_container")
            chrome.storage.local.get([url], function (res) {
                var title = get_title(res[url], url)
                var notes = get_notes(res[url], url)
                var highlight = get_highlight(res[url], url)
                var figs = get_figs(res[url], url)

                var entry_div = document.createElement('div')
                entry_div.classList.add("container-fluid")
                entry_div.classList.add("wiki_content")
                entry_div.appendChild(title)
                entry_div.appendChild(create_content_tree([{
                    name: "Entries",
                    content: [],
                    child: res[url].content.child
                }]))

                if (notes != null) entry_div.appendChild(notes)
                if (highlight != null) entry_div.appendChild(highlight)
                if (figs != null) entry_div.appendChild(figs)
                entry_div.appendChild(document.createElement("hr"))
                collected_div.appendChild(entry_div)

                // add to nav list
                var li = document.createElement("li")
                var a = document.createElement("a")
                a.href = "#" + url + "_nav"
                a.textContent = '- ' + res[url].title
                li.appendChild(a)
                nav_list.appendChild(li)
            })

        });
    })
}

function get_title(content, url) {
    var title = document.createElement('h3')
    title.id = url + "_nav"
    var title_a = document.createElement("a")
    title_a.textContent = content.title
    title_a.href = base_wiki_url + content.url
    title_a.setAttribute("target", "_blank")
    title.appendChild(title_a)
    return title
}

function get_notes(content, url, no_header = false) {
    var notes = document.createElement('p')
    if (no_header) {
        notes.innerHTML = content.notes
    } else {
        notes.innerHTML = "<strong>Notes: </strong>\n" + content.notes
    }
    notes.setAttribute("style", "white-space: pre-wrap;")
    if (content.notes == "" || content.notes == "Edit your note here...") notes = null
    return notes
}

function get_highlight(content, url, no_header = false) {
    var res = ``
    content.highlighted.forEach((h, index) => {
        res = res + (index + 1) + '. ' + h.text + `\n`
    })

    var highlight = document.createElement('div')
    var highlight_text = document.createElement('p')
    if (no_header) {
        highlight_text.innerHTML = res
    } else {
        highlight_text.innerHTML = "<strong>Highlighted: </strong>\n" + res
    }
    highlight.setAttribute("style", "white-space: pre-wrap;")
    highlight.appendChild(highlight_text)

    if (content.highlighted.length == 0) highlight = null

    return highlight
}

function get_figs(content, url) {
    var figs = document.createElement('div')
    figs.classList.add("d-flex")
    figs.classList.add("flex-wrap")
    content.saved_fig.forEach(f => {
        var img_div = document.createElement("div")
        img_div.setAttribute("style", "width:auto;text-align:center;")
        var img = document.createElement("img")
        var title = document.createElement("p")
        title.classList.add("fig_caption")
        title.setAttribute("style", "width:400px;text-align:center;")
        title.textContent = f.title
        img.src = f.src
        img.addEventListener('click', open_img, false)

        img_div.appendChild(img)
        var width_height = "width:auto;height:200px;"
        if (f.title[0] == "(" || f.title[0] == "{") {
            width_height = "width:auto;height:50px;"
        } else {
            img_div.appendChild(title)
        }
        img.setAttribute("style", width_height + "cursor:pointer;")
        img.classList.add("rounded")
        img_div.classList.add("p-2")
        figs.appendChild(img_div)
    })

    if (content.saved_fig.length == 0) figs = null

    return figs
}


function open_img() {
    window.open(this.src)
}