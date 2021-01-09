var base_wiki_url = "https://www.wikiwand.com"

function create_content_tree(content) {
    // console.log(content)
    var ul = document.createElement('ul')
    ul.classList.add('list_root')
    content.forEach(h => {
        let li_nested = document.createElement('li')
        let title = document.createElement('span')
        title.innerText = h.name
        title.classList.add("caret")
        title.addEventListener("click", function () {
            this.parentElement.querySelector(".nested").classList.toggle("active");
            this.classList.toggle("caret-down");
        })
        li_nested.appendChild(title)

        let ul_nest = document.createElement('ul')
        ul_nest.classList.add("nested")

        h.child.forEach(item => {
            ul_nest.appendChild(create_content_tree([item]))
        })

        h.content.forEach(item => {
            let li_content = document.createElement('li')
            let link = document.createElement('a')
            link.textContent = decodeURIComponent(item.split("/").slice(-1)[0].replace('_', ' '))
            link.setAttribute('href', base_wiki_url + item)
            link.setAttribute('target', "_blank")
            li_content.appendChild(link)
            ul_nest.appendChild(li_content)
        })

        li_nested.appendChild(ul_nest)
        ul.appendChild(li_nested)
    });
    return ul
}

function gen_content_list(content, content_list) {
    content.forEach(h => {
        h.content.forEach(item => {
            if (!content_list.includes(item)) content_list.push(item)
        })
        h.child.forEach(item => {
            content_list = gen_content_list([item], content_list)
        })
    })
    return content_list
}

function create_content_list(content) {
    var content_list = gen_content_list(content, [])
    content_list = content_list.sort((a, b) => (a > b) ? 1 : -1)
    var ul = document.createElement('ul')
    content_list.forEach(item => {
        let li_content = document.createElement('li')
        let link = document.createElement('a')
        link.textContent = decodeURIComponent(item.split("/").slice(-1)[0].replace('_', ' '))
        link.setAttribute('href', base_wiki_url + item)
        link.setAttribute('target', "_blank")
        li_content.appendChild(link)
        ul.appendChild(li_content)
    })
    return ul

}

function highlight_img(srcUrl) {
    var alt
    var img = [...document.getElementsByTagName("img")]
    img.forEach(i => {
        if (i.src == srcUrl) {
            i.setAttribute("style", "border: 5px solid green;")
            alt = i.alt
        }
    })
    return alt
}

function highlight_text(selection = null) {
    if (selection == null) selection = window.getSelection()
    var sel_text = selection.toString();
    res = {
        text: sel_text,
        range: null
    }
    var span = document.createElement("span");
    span.style.fontWeight = "bold";
    span.style.color = "rgb(10,10,200)";
    span.style.backgroundColor = "yellow";

    if (selection.rangeCount) {
        var range = selection.getRangeAt(0).cloneRange();
        range.surroundContents(span);
        selection.removeAllRanges();
        selection.addRange(range);
    }
    console.log(res.range)

    return res
}

function create_modal() {
    var modal = document.createElement("div")
    modal.id = "myModal"
    modal.classList.add("modal")
    modal.setAttribute("style",
        `display: none;
        position: fixed; 
        z-index: 999;
        padding-top: 100px; 
        left: 0;
        top: 0;
        width: 100%;
        height: 100%;
        overflow: auto;
        background-color: rgb(0,0,0);
        background-color: rgba(0,0,0,0.4)`);

    var modal_content = document.createElement("div")
    modal_content.classList.add("modal_content")
    modal_content.setAttribute("style",
        `background-color: #fefefe;
        margin: auto;
        padding: 20px;
        border: 1px solid #888;
        width: 600px;
        height: 800px;
        background-color: rgba(0,0,0,0.5)`);

    var h2 = document.createElement("h2")
    h2.textContent = "NOTES (To toggle NOTES, press ` key twice)"

    var text_area = document.createElement("textarea")
    text_area.id = "wiki_collector_notes"
    text_area.setAttribute("style",
        `font-size:14px;
        color: rgb(200, 200, 200);
        background-color: rgba(0,0,0,0.5);
        resize: none;
        margin-top:5px;
        margin-bottom:10px;`);
    text_area.setAttribute("rows", "36")
    text_area.setAttribute("cols", "74")
    text_area.value = "Edit your note here..."

    var btn = document.createElement("button")
    btn.textContent = "Update Notes"

    modal_content.appendChild(h2)
    modal_content.appendChild(text_area)
    modal_content.appendChild(btn)
    modal.appendChild(modal_content)

    btn.addEventListener("click", update_notes)

    return modal
}

function update_notes() {
    update_storage(win_url, "notes")
}

function update_storage(win_url, key = null, content = "") {
    // console.log(win_url, key, content)
    var new_content = get_page_details()

    chrome.runtime.sendMessage({
        msg: "ready",
        content: new_content
    }, function () {
        chrome.storage.local.get(["collected_list", "opened_page", win_url], function (res) {
            // initalize 
            if (res.collected_list == undefined) {
                res.collected_list = []
            }
            if (res[win_url] == undefined) {
                res[win_url] = res.opened_page[win_url]
                res.collected_list.push(win_url)
            }
            // console.log(1, res[win_url])

            chrome.storage.local.set({
                [win_url]: res[win_url],
                collected_list: res.collected_list
            }, function () {
                chrome.storage.local.get(["collected_list", "opened_page", win_url], function (res) {
                    // first visit of the page
                    if (!res.collected_list.includes(win_url)) {
                        res.collected_list.push(win_url)
                    }
                    if (res[win_url] != undefined) {
                        // if previously the page is not fully loaded
                        if (res[win_url].content.child.length == 0) {
                            res[win_url] = res.opened_page[win_url]
                        }
                        // update the fields
                        if (key != null) {
                            if (key == "notes") {
                                var textarea = document.getElementById('wiki_collector_notes')
                                if (textarea != null) {
                                    content = textarea.value
                                }
                                res[win_url][key] = content
                            } else {
                                res[win_url][key].push(content)
                            }
                            console.log(key, " added.")
                            // console.log(res[win_url][key])
                        }
                    }
                    // update storage
                    chrome.storage.local.set({
                        [win_url]: res[win_url],
                        collected_list: res.collected_list
                    })
                })
            });
        })
    })
}


function previous_marked() {
    chrome.storage.local.get([win_url], function (res) {
        if (res[win_url] != undefined) {
            // resume fig
            res[win_url].saved_fig.forEach(f => {
                highlight_img(f.src)
            })
            // todo: resume text
            // resume notes
            if (res[win_url].notes != "") {
                console.log(res[win_url].notes)
                document.getElementById("wiki_collector_notes").value = res[win_url].notes
            }
        }
    })
}

function export_file() {
    console.log(1)
    chrome.storage.local.get(["collected_list"], function (result) { // null implies all items
        // Convert object to a string.
        chrome.storage.local.get(result.collected_list, function (result) {
            var result = JSON.stringify(result, undefined, 4);
            // Save as file
            var url = 'data:application/json;base64,' + btoa(unescape(encodeURIComponent(result)));
            chrome.downloads.download({
                url: url,
                filename: 'wiki_collector.json',
                conflictAction: "overwrite"
            });
        })
    });
}

function read_json_file(file) {
    return new Promise((resolve, reject) => {
        let reader = new FileReader();

        reader.onload = () => {
            resolve(reader.result);
        };
        reader.onerror = reject;
        reader.readAsText(file);
    })
}

function create_btn(mid_name) {
    var btn = document.createElement('button')
    btn.classList.add("btn")
    btn.classList.add("btn-sm")
    var icon = document.createElement("i")
    icon.classList.add("mdi")
    icon.classList.add(mid_name)
    icon.setAttribute("aria-hidden", "true")
    btn.appendChild(icon)

    return btn
}


// todo: 1. switch notebooks, 2. new words, 3. delete entries, 4. how to resume highlited text, 5. fix collect and update
// note: 1. you need to add listener for element fucntion instead of set "onclick" attributes