function show_notes() {
    chrome.storage.local.get(["collected_list"], function (res) {
        if (res.collected_list.length > 0) {
            var nothing_text = [...document.getElementsByClassName("nothing_text")]
            nothing_text.forEach(e => {
                e.parentNode.removeChild(e)
            })
            clear_content()
        }
        // console.log(res.collected_list)
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

                entry_div.id = "entry_" + url
                collected_div.appendChild(entry_div)
            })
        })
    })
}

function get_keywords(text, num = 10) {
    var word_list = text.split(' ')
    const regex = /[^0-9a-z]/gi;
    word_list = word_list.map(x => x.toLocaleLowerCase().replace(regex, ""))
    var word_count = {}
    word_list.forEach(element => {
        if (word_count[element] == undefined) word_count[element] = 1
        else word_count[element]++
    });

    word_count = Object.keys(word_count).map((key) => {
        var temp = {
            key: key,
            val: word_count[key]
        };
        return temp
    });

    word_count.sort((a, b) => (a.val > b.val) ? -1 : 1)
    var res = []
    word_count.forEach(w => {
        if (!key_words_exclude.includes(w.key)) res.push(w.key)
    })
    return res.slice(0, num)
}