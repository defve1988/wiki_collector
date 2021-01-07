function show_all() {
    chrome.tabs.create({
        url: 'all_wiki.html'
    })
}

function expand_all() {
    var btn = document.getElementById('expand_all')
    if (btn.value == "expand_all") {
        btn.value = "collapse_all"
        btn.childNodes[1].classList.remove("mdi-arrow-expand-down")
        btn.childNodes[1].classList.add("mdi-arrow-collapse-up")
        var tree_nodes = [...document.getElementsByClassName('caret')]
        tree_nodes.forEach(node => {
            node.parentElement.querySelector(".nested").classList.toggle("active");
            node.classList.toggle("caret-down");
        })
    } else {
        btn.value = "expand_all"
        btn.childNodes[1].classList.remove("mdi-arrow-collapse-up")
        btn.childNodes[1].classList.add("mdi-arrow-expand-down")
        var tree_nodes = [...document.getElementsByClassName('caret')]
        tree_nodes.forEach(node => {
            node.parentElement.querySelector(".nested").classList.remove("active");
            node.classList.remove("caret-down");
        })
    }
}

function clear_entry_list() {
    var entry_list = [...document.getElementsByClassName('entry_list')][0]
    if (entry_list != undefined) {
        entry_list.parentNode.removeChild(entry_list)
    }
}

function list_view() {
    clear_entry_list()
    document.getElementById('expand_all').disabled = true;
    var btn = document.getElementById('list_view')
    if (btn.value == "tree_view") {
        btn.value = "list_view"
        // console.log(btn,btn.childNodes)
        btn.childNodes[1].classList.remove("mdi-format-list-bulleted")
        btn.childNodes[1].classList.add("mdi-file-tree")
        set_page("list_view")
    } else {
        btn.value = "tree_view"
        btn.childNodes[1].classList.remove("mdi-file-tree")
        btn.childNodes[1].classList.add("mdi-format-list-bulleted")
        document.getElementById('expand_all').disabled = false;
        set_page("tree_view")
    }
}

function set_page(view = "tree_view") {
    clear_entry_list()
    chrome.storage.local.get(["opened_page"], function (items) {
        var curr_tab
        chrome.tabs.query({
            active: true,
            lastFocusedWindow: true
        }, function (tabs) {
            // and use that tab to fill in out title and url
            curr_tab = tabs[0];
            // make sure content link is also working
            var wiki_url = curr_tab.url.replace(base_wiki_url, "").split("#")[0]
            console.log(wiki_url)
            console.log(items)
            document.getElementById("page_title").textContent = items.opened_page[wiki_url].title

            var content = items.opened_page[wiki_url].content.child
            // console.log(items.opened_page[wiki_url].content)

            var entry_list = document.createElement('div')
            entry_list.classList.add('entry_list')

            if (view == "tree_view") {
                entry_list.appendChild(create_content_tree(content))
            } else {
                entry_list.appendChild(create_content_list(content))
            }
            // console.log(entry_list)
            document.body.appendChild(entry_list)
        });
    });
}

function refresh_page() {
    chrome.tabs.query({
        currentWindow: true,
        active: true
    }, function (tabs) {
        var activeTab = tabs[0];
        chrome.tabs.sendMessage(activeTab.id, {
            msg: "refresh",
            content: ""
        });
    });

}

window.onload = function () {
    document.getElementById('show_all').addEventListener('click', show_all, false)
    document.getElementById('export_file').addEventListener('click', export_file, false)
    document.getElementById('list_view').addEventListener('click', list_view, false)
    document.getElementById('expand_all').addEventListener('click', expand_all, false)
    document.getElementById('refresh').addEventListener('click', refresh_page, false)
    set_page("tree_view")
    // todo: load the tree list status

    var loading_text = document.getElementById('loading_text')
    loading_text.parentNode.removeChild(loading_text)

    document.getElementsByTagName("head")[0].insertAdjacentHTML(
        "beforeend",
        "<link rel=\"stylesheet\" href=\"style/snack_bar.css\" />");
}

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    if (request.msg == "update_popup") {
        set_page("tree_view")
    }
})

window.onclose = function () {
    // todo: store and send tree list status
}