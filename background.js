chrome.runtime.onInstalled.addListener(function () {
    chrome.storage.local.clear()
    chrome.storage.local.set({
        opened_page: {},
        collected_list: [],
    });
    chrome.storage.local.get(["opened_page", "collected_list"], function (res) {
        console.log('collected', res.collected_list)
        console.log('opened', res.opened_page)
    })
});

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    if (request.msg == "ready") {
        var content = request.content
        chrome.storage.local.get(["opened_page"], function (result) {
            result.opened_page[content.url] = content
            chrome.storage.local.set({
                opened_page: result.opened_page
            }, function () {
                chrome.runtime.sendMessage({
                    msg: "update_popup",
                    content: ""
                })
            });
        });
        sendResponse({
            msg: "finished",
            content: ""
        });
    }
    if (request.msg == "open_all_wiki") {
        chrome.tabs.create({
            url: 'all_wiki.html',
            index: 0
        })
    }
})


var menuItem_1 = {
    "id": "highlight_it",
    "title": "Highlight it",
    "contexts": ["selection"]
};
var menuItem_2 = {
    "id": "save_it",
    "title": "Save it",
    "contexts": ["image"]
};
var menuItem_3 = {
    "id": "collect_it",
    "title": "Collect it",
    "contexts": ["page"]
};


chrome.contextMenus.create(menuItem_1);
chrome.contextMenus.create(menuItem_2);
chrome.contextMenus.create(menuItem_3);

chrome.contextMenus.onClicked.addListener(function (clickData) {
    var msg = {
        msg: "",
        content: ""
    }
    if (clickData.menuItemId == "highlight_it" && clickData.selectionText) {
        msg.msg = "highlight_it"
    } else if (clickData.menuItemId == "collect_it") {
        msg.msg = "collect_it"
    } else if (clickData.menuItemId == "save_it") {
        msg.msg = "save_it"
        // console.log(clickData)
        msg.content = clickData.srcUrl
    }

    chrome.tabs.query({
        active: true,
        currentWindow: true
    }, function (tabs) {
        chrome.tabs.sendMessage(tabs[0].id, msg);
    });
});

// window.open("popup.html", "extension_popup")