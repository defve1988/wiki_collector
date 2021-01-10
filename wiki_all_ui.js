function create_image_modal() {
    var image_modal = document.createElement("div")
    image_modal.id = "image_modal"
    image_modal.classList.add("modal")
    image_modal.setAttribute("style",
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

    var modal_img_content = document.createElement("img")
    modal_img_content.id = "modal_img_content"
    modal_img_content.src = ""
    modal_img_content.setAttribute("style",
        `border: 1px solid #888;
        display: block;
        margin-left: auto;
        margin-right: auto;
        float: center;
        width: auto;
        height: auto;
        background-color: rgba(0,0,0,0.5)`);

    image_modal.appendChild(modal_img_content)

    return image_modal
}

function create_nav_list() {
    document.getElementById("collected_list").innerHTML = null
    chrome.storage.local.get(["collected_list"], function (res) {
        res.collected_list.forEach((url, index) => {
            var nav_list = document.getElementById("collected_list")
            chrome.storage.local.get([url], function (res) {
                var li = document.createElement("li")
                li.classList.add("nav_li")
                if (index == 0) {
                    li.classList.add("selected")
                }
                li.addEventListener('click', function (event) {
                    location.href = "#" + url + "_nav";
                    // console.log(event.target)
                    var nav_li = [...document.getElementsByClassName("nav_li")]
                    nav_li.forEach(e => {
                        e.classList.remove("selected")
                    })
                    event.target.classList.add("selected")
                })
                li.textContent = res[url].title
                nav_list.appendChild(li)
            })
        })
    })
}


function add_elements() {
    // add nav list
    create_nav_list()

    // add file upload
    var input = document.createElement("input")
    input.type = "file"
    input.id = "file_selector"
    input.accept = ".json"
    input.setAttribute("style", "display:none")
    document.getElementById('app_header').appendChild(input)
    const fileSelector = document.getElementById('file_selector');
    fileSelector.addEventListener('change', (event) => {
        const fileList = event.target.files;
        // console.log(fileList);
        read_json_file(fileList[0]).then(res => {
            var content = JSON.parse(res)
            console.log(content)
            var word_list = content.word_list
            delete content.word_list
            // update content
            chrome.storage.local.set(content, function () {
                // msg: file loaded
                // alert("file uploaded.")
            })
            // update collected page array
            chrome.storage.local.get(["collected_list"], function (res) {
                var collected = Object.keys(content).map((key) => key)
                collected.forEach(x => {
                    if (!res.collected_list.includes(x)) res.collected_list.push(x)
                })
                chrome.storage.local.set({
                    collected_list: res.collected_list
                })
            })
            // update word_list
            chrome.storage.local.get(["word_list"], function (res) {
                chrome.storage.local.set({
                    word_list: res.word_list.concat(word_list)
                })
            })
        })
        // update ui
        location.reload();
    });

    // create image modal
    document.body.appendChild(create_image_modal())

}


var dict_api = "https://api.dictionaryapi.dev/api/v2/entries/en/"
var search_word = "https://www.google.com/#q=define+"

function create_word_tooltip(word, parent_id, show_btn = false) {
    // console.log(word)
    word = word.trim()
    var url = dict_api + word
    var class_list = [...document.getElementById(parent_id).classList]
    if (class_list.includes("loaded")) {
        return
    }
    // console.log(url)
    fetch(url).then(res => {
        res.json().then(res => {
            res = res[0]
            // console.log(JSON.stringify(res))
            var tooltip_div = document.createElement("div")
            tooltip_div.classList.add("word_tooltiptext")

            var header = document.createElement("div")
            header.classList.add("word_content")

            if (show_btn) {
                var save_btn = document.createElement("span")
                save_btn.innerHTML = "♡"
                save_btn.setAttribute("style",
                    `font-size:24px;
                    margin-right:5px;
                    cursor:pointer;`)
                save_btn.addEventListener("click", function () {
                    if (save_btn.innerHTML == "♡") {
                        save_btn.innerHTML = "♥"
                        word_list_add(word)
                    } else {
                        save_btn.innerHTML = "♡"
                        word_list_remove(word)
                    }
                })
                header.appendChild(save_btn)
            }

            var audio = document.createElement("audio")
            audio.id = "audio_" + word
            audio.src = res.phonetics[0].audio
            audio.type = "audio/mpeg"

            var play_btn = document.createElement("i")
            play_btn.classList.add("word_pronounce")
            play_btn.classList.add("mdi")
            play_btn.classList.add("mdi-volume-high")
            play_btn.addEventListener("click", function () {
                document.getElementById("audio_" + word).play();
            })

            var word_link = document.createElement("a")
            word_link.setAttribute("href", search_word + word)
            word_link.setAttribute("target", "_blank")
            word_link.setAttribute("style", "color:rgb(255, 117, 5);")
            word_link.innerHTML = " <u><strong>" + word + "</strong></u>"
            var pronounce_text = document.createElement("span")
            pronounce_text.classList.add("word_pronounce_text")
            pronounce_text.innerText = " " + res.phonetics[0].text
            pronounce_text.addEventListener("click", function () {
                document.getElementById("audio_" + word).play();
            })

            header.appendChild(play_btn)
            header.appendChild(audio)
            header.appendChild(word_link)
            header.appendChild(pronounce_text)

            tooltip_div.appendChild(header)

            res.meanings.forEach(meaning => {
                var content_div = document.createElement("div")
                content_div.classList.add("word_content")
                var partOfSpeech = document.createElement("p")
                partOfSpeech.classList.add("partOfSpeech")
                partOfSpeech.textContent = meaning.partOfSpeech
                content_div.appendChild(partOfSpeech)

                var ol_list = document.createElement("ol")
                ol_list.classList.add("word_li")

                meaning.definitions.forEach(d => {
                    var li = document.createElement("li")
                    var word_definition = document.createElement("div")
                    word_definition.classList.add("word_definition")
                    word_definition.textContent = d.definition
                    li.appendChild(word_definition)

                    if (d.example != undefined) {
                        var word_example = document.createElement("div")
                        word_example.classList.add("word_example")
                        word_example.textContent = '"' + d.example + '"'
                        li.appendChild(word_example)
                    }

                    if (d.synonyms != undefined) {
                        var word_synonyms = document.createElement("div")
                        word_synonyms.classList.add("word_synonyms")
                        var s_title = document.createElement("span")
                        s_title.innerHTML = '<span style="color:greenyellow"><strong>Similar:</strong></span> '
                        word_synonyms.appendChild(s_title)
                        d.synonyms.forEach(s => {
                            var s_a = document.createElement("a")
                            s_a.setAttribute("style", "color:rgb(5, 255, 101);")
                            s_a.setAttribute("href", search_word + s)
                            s_a.setAttribute("target", "_blank")
                            s_a.textContent = s
                            word_synonyms.appendChild(s_a)
                            word_synonyms.innerHTML += ", "
                        })
                        li.appendChild(word_synonyms)
                    }
                    ol_list.appendChild(li)
                })
                content_div.appendChild(ol_list)
                tooltip_div.appendChild(content_div)

            })

            document.getElementById(parent_id).appendChild(tooltip_div)
            document.getElementById(parent_id).classList.add("loaded")
        })
    })

}