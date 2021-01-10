var base_wiki_url = "https://www.wikiwand.com"
window.onload = function () {
    // chrome.storage.local.get(["/en/Antonin_Scalia", "collected_list"], function (res) {
    //     console.log(res)
    // })
    add_elements()
    document.getElementById('list_all').addEventListener('click', list_all, false)
    document.getElementById('net_work').addEventListener('click', net_work, false)
    document.getElementById('show_notes').addEventListener('click', show_word_list, false)
    document.getElementById('show_figs').addEventListener('click', show_figs, false)
    document.getElementById('upload_file').addEventListener('click', upload_file, false)
    document.getElementById('export_file').addEventListener('click', export_file, false)

    document.getElementById('app_setting').addEventListener('click', app_setting, false)
    document.getElementById('app_setting').style.display = "none"
    list_all()

    window.onclick = function (event) {
        if (event.target == image_modal) {
            image_modal.style.display = "none";
        }
        var class_list = [...event.target.classList]
        // console.log(class_list)

        if (!class_list.includes("note_text") && !class_list.includes("mdi-pencil") && !class_list.includes("eidt_note_btn")) {
            var notes = [...document.getElementsByClassName("note_text")]
            notes.forEach(x => {
                if (x.textContent.trim() == "") x.parentElement.style.display = "none"
                x.classList.remove("editor_input")
                x.setAttribute("contenteditable", "false")
            })
        }
    }

    // todo: add some review functions, randomized list
}

function toggle_group(button_id, group_class="toggle_group"){
    var group = [...document.getElementsByClassName(group_class)]
    group.forEach(g=>{
        g.classList.remove("btn_active")
    })
    document.getElementById(button_id).classList.add("btn_active")
}

function app_setting() {}

function show_word_list() {
    toggle_group("show_notes")
    clear_content()
    var collected_div = document.getElementById("article_container")

    var btn_collection = document.createElement("div")
    btn_collection.classList.add("wiki_content")

    var btn_list_view = create_btn("mdi-view-headline")
    btn_list_view.id = "btn_list_view"
    btn_list_view.addEventListener("click", show_word_list_words)
    var btn_card_view = create_btn("mdi-card-text-outline")
    btn_card_view.id = "btn_card_view"
    btn_card_view.addEventListener("click", show_word_list_cards)

    btn_collection.appendChild(btn_list_view)
    btn_collection.appendChild(btn_card_view)

    collected_div.appendChild(btn_collection)
    show_word_list_words()

}

function show_word_list_words() {
    var word_list_div = document.getElementById("wiki_content_word_list")
    // console.log(word_list_div)
    if (word_list_div !=null){
        word_list_div.parentElement.removeChild(word_list_div)
    }

    document.getElementById("btn_list_view").classList.add("btn_active")
    document.getElementById("btn_card_view").classList.remove("btn_active")

    chrome.storage.local.get(["word_list"], function (res) {
        var collected_div = document.getElementById("article_container")
        var gallery = document.createElement("div")
        gallery.classList.add("wiki_content")
        gallery.id = "wiki_content_word_list"

        res.word_list.forEach(w => {
            var word_line = document.createElement("div")
            word_line.id = "word_line_" + w
            word_line.setAttribute("style",
                `width:150px;
            text-align:right;
            `)

            var close_btn = document.createElement("i")
            close_btn.classList.add("mdi")
            close_btn.classList.add("mdi-delete-outline")
            close_btn.setAttribute("style",
                `font-size:14px; 
                margin-right:5px;
                cursor:pointer;
                `)
            close_btn.addEventListener("click", function () {
                word_list_remove(w)
                word_line.parentElement.removeChild(word_line)
            })
            word_line.appendChild(close_btn)

            var word = document.createElement("div")
            word_line.appendChild(word)
            word.id = "word_list_" + w
            word.classList.add("word_tooltip")
            word.textContent = w
            word.addEventListener("mouseenter", function () {
                create_word_tooltip(w, word.id, false)
            })
            gallery.appendChild(word_line)
        })
        collected_div.appendChild(gallery)
        res.word_list.forEach(w => {
            create_word_tooltip(w, "word_list_" + w, false)
        })
    })
}

function show_word_list_cards() {
    var word_list_div = document.getElementById("wiki_content_word_list")
    // console.log(word_list_div)
    if (word_list_div !=null){
        word_list_div.parentElement.removeChild(word_list_div)
    }

    document.getElementById("btn_card_view").classList.add("btn_active")
    document.getElementById("btn_list_view").classList.remove("btn_active")

    chrome.storage.local.get(["word_list"], function (res) {
        var collected_div = document.getElementById("article_container")
        var gallery = document.createElement("div")
        gallery.classList.add("wiki_content")
        gallery.id = "wiki_content_word_list"


        res.word_list.forEach(w => {
            var word_line = document.createElement("div")
            word_line.id = "word_line_" + w

            var word = document.createElement("div")
            word_line.appendChild(word)
            word.id = "word_list_" + w
            word.addEventListener("mouseenter", function () {
                create_word_tooltip(w, word.id, false)
            })
            gallery.appendChild(word_line)
        })
        collected_div.appendChild(gallery)
        res.word_list.forEach(w => {
            create_word_tooltip(w, "word_list_" + w, false)
        })
    })
}

function net_work() {
    toggle_group("net_work")
    clear_content()

    var collected_div = document.getElementById("article_container")
    var svg_div = document.createElement("div")
    svg_div.classList.add("wiki_content")
    // svg_div.setAttribute("style","height:100px;width:1000px;")

    var count_text = document.createElement("div")
    count_text.id = "total_collected"

    var svg = document.createElement("svg")
    collected_div.appendChild(svg_div)
    svg.id = "network_svg"

    svg_div.appendChild(count_text)
    svg_div.appendChild(svg)
    create_graph()
}



function upload_file() {
    document.getElementById('file_selector').click();
}

function show_figs() {
    toggle_group("show_figs")
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
                    gallery.appendChild(create_img_div(url, f, false))
                })
            })
            collected_div.appendChild(gallery)
        })
    })
}

function clear_content() {
    var content = [...document.getElementsByClassName("wiki_content")]
    // console.log(content)
    content.forEach(c => {
        c.parentNode.removeChild(c)
    })
}

function list_all() {
    toggle_group("list_all")
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
                entry_div.id = "entry_" + url
                collected_div.appendChild(entry_div)
            })

        });
    })
}

function get_title(content, url) {
    var title = document.createElement('h3')
    title.id = url + "_nav"
    var title_a = document.createElement("a")

    var btn = create_btn("mdi-delete-outline")
    btn.addEventListener("click", function () {
        var res = confirm("Delete this entry?")
        if (res) {
            chrome.storage.local.remove([url])
            chrome.storage.local.get(["collected_list"], function (res) {
                chrome.storage.local.set({
                        collected_list: res.collected_list.filter(item => item !== url)
                    },
                    function () {
                        var entry_div = document.getElementById("entry_" + url)
                        entry_div.parentElement.removeChild(entry_div)
                        create_nav_list()
                    })
            })
        }
    })
    title_a.textContent = content.title
    title_a.href = base_wiki_url + content.url
    title_a.setAttribute("target", "_blank")
    title.appendChild(title_a)
    title.appendChild(btn)

    return title
}



function get_notes(content, url, no_header = false) {
    var note_div = document.createElement('div')

    var notes_header = document.createElement('div')
    notes_header.setAttribute("style", "margin-bottom:5px;")
    notes_header.innerHTML = "<strong>Notes </strong>\n"
    var edit_btn = create_btn("mdi-pencil")
    edit_btn.classList.add("eidt_note_btn")
    edit_btn.addEventListener("click", function () {
        let notes = document.getElementById("notes_" + url)
        notes.parentElement.style.display = "block"
        notes.setAttribute("contenteditable", "true")
        notes.classList.add("editor_input")
        notes.focus()
    })

    notes_header.appendChild(edit_btn)

    var notes_content = document.createElement('div')
    var notes = document.createElement('p')
    notes.classList.add("note_text")
    notes.textContent = content.notes
    notes.id = "notes_" + url
    notes.setAttribute("style", "display: inline-block;white-space: pre-wrap;width:100%;")
    notes.setAttribute("contenteditable", "false")
    notes.addEventListener("dblclick", function () {
        let notes = document.getElementById("notes_" + url)
        notes.setAttribute("contenteditable", "true")
        notes.classList.add("editor_input")
    })
    notes.addEventListener("input", function (inputs) {
        chrome.storage.local.get([url], function (res) {
            res[url].notes = inputs.target.textContent
            chrome.storage.local.set({
                [url]: res[url]
            })
        })
    }, false);
    notes_content.appendChild(notes)
    // console.log(content.notes.trim())
    var display = content.notes.trim() == "" || content.notes.trim() == "Edit your note here..." ? "none" : "block"
    notes_content.style.display = display

    note_div.appendChild(notes_header)
    note_div.appendChild(notes_content)

    return note_div
}

function get_highlight(content, url, no_header = false) {

    var highlight_div = document.createElement('div')

    var highlight_header = document.createElement('div')
    highlight_header.setAttribute("style", "margin-bottom:5px;")
    highlight_header.innerHTML = "<strong>Highlights </strong>\n"

    highlight_div.appendChild(highlight_header)

    var highlight_context = document.createElement('div')
    highlight_context.classList.add("d-flex")
    highlight_context.classList.add("flex-wrap")

    content.highlighted.forEach((h, index) => {
        var highlight_text = document.createElement('div')
        highlight_text.setAttribute("style", "white-space: pre-wrap;margin-bottom:10px;")
        highlight_text.textContent = h.text
        highlight_text.classList.add("highlighted_text")

        highlight_text.addEventListener("click", function (event) {
            var res = confirm("Delete this highlight?")
            if (res) {
                // note: template to remove somthing 
                chrome.storage.local.get([url], function (res) {
                    res[url].highlighted = res[url].highlighted.filter(x => x.text != h.text)
                    chrome.storage.local.set({
                        [url]: res[url]
                    })
                })
                event.target.parentElement.removeChild(event.target)
            }
        })
        highlight_context.appendChild(highlight_text)

    })

    highlight_div.appendChild(highlight_context)

    return highlight_div
}

function get_figs(content, url) {
    var figs = document.createElement('div')
    figs.classList.add("d-flex")
    figs.classList.add("flex-wrap")
    content.saved_fig.forEach(f => {
        figs.appendChild(create_img_div(url, f))
    })

    if (content.saved_fig.length == 0) figs = null

    return figs
}


function open_img_modal(target) {
    image_modal.style.display = "block";
    // image_modal.style.visibility = "visible"
    // image_modal.style.opacity = 1
    document.getElementById("modal_img_content").src = target.src
}

function create_img_div(url, f, show_title = true) {
    var img_div = document.createElement("div")
    img_div.setAttribute("style", "width:auto;text-align:center;")
    var img = document.createElement("img")

    var title = document.createElement("p")
    title.classList.add("fig_caption")
    title.setAttribute("style", "width:auto;max-width:400px;text-align:center;margin-bottom:5px;")
    title.textContent = f.title
    img.src = f.src
    img.addEventListener('mousedown', function (event) {
        if (event.buttons == 1) {
            open_img_modal(event.target)
        } else if (event.buttons == 2) {

            var res = confirm("Delete this image?")
            if (res) {
                // note: template to remove somthing 
                chrome.storage.local.get([url], function (res) {
                    res[url].saved_fig = res[url].saved_fig.filter(x => x.src != f.src)
                    chrome.storage.local.set({
                        [url]: res[url]
                    })
                })
                event.target.parentElement.parentElement.removeChild(event.target.parentElement)
            }
        }
    })

    img_div.appendChild(img)
    var width_height = "width:auto;height:200px;"
    if (f.title[0] == "(" || f.title[0] == "{" || f.title[0] == "/") {
        width_height = "width:auto;height:50px;"
    } else if (show_title) {
        img_div.appendChild(title)
    }
    img.setAttribute("style", width_height + "cursor:pointer;")
    img.classList.add("rounded")
    img_div.classList.add("p-2")
    return img_div
}