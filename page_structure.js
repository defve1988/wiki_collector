function get_page_details() {
    // h1
    //  h2
    //      h3
    //          p, a, b > a
    //          ul > li, a, b > a

    var h1 = [...document.getElementsByTagName("h1")]
    h1_text = h1[0].innerText.trim()

    var related = "#read_more > a"
    var related = document.querySelectorAll(related)
    related_content = {}
    related.forEach(h => related_content[h.href] = h.innerText.trim())

    var section = "#fullContent > section"
    var section = document.querySelectorAll(section)
    // console.log(section)
    var section_content = {
        name: h1_text,
        child: []
    }
    var added_url = []
    section.forEach(node => {
        var under = 'h2'
        var under_h2 = {
            name: "Over View",
            content: [],
            child: []
        }
        var under_h3 = {
            name: "",
            content: [],
            child: []
        }

        var next = node.firstChild;
        while (next != null) {
            var tag_name = String(next.tagName).toLocaleLowerCase()

            if (tag_name == "h2") {
                under_h2.name = next.innerText
            }

            if (tag_name == "h3") {
                if (under == "h3") {
                    under_h2.child.push(under_h3)
                    var under_h3 = {
                        name: "",
                        content: [],
                        child: []
                    }
                }
                under_h3.name = next.innerText
                under = "h3"
            }

            var links = []
            if (tag_name == "p") {
                links = next.querySelectorAll('a', 'b > a')
            }

            if (tag_name == "ul") {
                links = next.querySelectorAll('li > a, li > b > a')
            }

            if (links.length > 0) {
                links.forEach(h => {
                    let href = h.href.replace(base_wiki_url, "")
                    if (under == "h2" && h.classList.contains("int-link") && !added_url.includes(href)) under_h2.content.push(href)
                    if (under == "h3" && h.classList.contains("int-link") && !added_url.includes(href)) under_h3.content.push(href)
                    added_url.push(href)
                })
            }

            next = next.nextSibling;
        }

        if (under_h3.content.length > 0) under_h2.child.push(under_h3)
        if (under_h2.content.length > 0 || under_h2.child.length > 0) section_content.child.push(under_h2)
    })

    // console.log(JSON.stringify(section_content, undefined, 4))

    return {
        url: win_url,
        title: h1_text,
        related: related_content,
        content: section_content,
        highlighted: [],
        saved_fig: [],
        notes: ""
    }
}


