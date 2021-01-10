var base_wiki_url = "https://www.wikiwand.com"
var modal
var pre_key = null
var win_url = window.location.href.replace(base_wiki_url, "").split("#")[0]

document.onreadystatechange = function () {
    if (document.readyState === 'complete') {
        onReady()
        previous_marked()

        // create_snack_bar()
    }
}


function onReady() {
    modal = create_modal()
    document.body.appendChild(modal)
    window.onclick = function (event) {
        if (event.target == modal) {
            modal.style.display = "none";
        }
    }

    var content = get_page_details()
    chrome.runtime.sendMessage({
        msg: "ready",
        content: content
    })
}

document.addEventListener("keydown", function (zEvent) {
    if ((zEvent.altKey && zEvent.key === "`") || (zEvent.key == "`" && zEvent.key === pre_key)) {
        modal.style.display = modal.style.display == "block" ? "none" : "block";
        pre_key = null
    } else {
        if (zEvent.altKey && zEvent.key === "w") {
            chrome.runtime.sendMessage({
                msg: "open_all_wiki",
                content: ""
            })
        }
        if (zEvent.altKey && zEvent.key === "1") {
            var sel_text = highlight_text()
            update_storage(win_url, "highlighted", sel_text)
        }
        if (zEvent.key == "Escape" || zEvent.key == "esc") {
            modal.style.display = "none";
        }
        if (zEvent.altKey && zEvent.key === "Enter") {
            update_storage(win_url, "notes")
        }
        pre_key = zEvent.key


    }
});

document.addEventListener('click', function (event) {
    if (event.altKey) {
        var selection = window.getSelection()
        // console.log(selection.toString().trim())
        if (selection.toString().trim()!="") {
            var span = document.createElement("span");
            var word = selection.toString()
            span.id = "search_word_dict" + word
            span.classList.add("word_tooltip")
            if (selection.rangeCount) {
                var range = selection.getRangeAt(0).cloneRange();
                range.surroundContents(span);
                selection.removeAllRanges();
                selection.addRange(range);
            }
            create_word_tooltip(word, span.id, true)

            window.getSelection().empty()
        }
    }
});

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    // console.log(request)
    if (request.msg == "refresh") {
        // alert(1)
        var content = get_page_details()
        chrome.runtime.sendMessage({
            msg: "ready",
            content: content
        })
    } else {
        // collect_page(win_url)
        if (request.msg == "highlight_it") {
            var sel_text = highlight_text()
            update_storage(win_url, "highlighted", sel_text)
        }
        if (request.msg == "save_it") {
            var alt = highlight_img(request.content)
            update_storage(win_url, "saved_fig", {
                src: request.content,
                title: alt
            })
        }
        if (request.msg == "collect_it") {
            update_storage(win_url)
        }
    }
})

window.onclose = function () {
    // del this opened page
    chrome.storage.local.get(["opened_page"], function (res) {
        delete res.opened_page[win_url];
        chrome.storage.local.set({
            opened_page: res.opened_page
        });
    })
}