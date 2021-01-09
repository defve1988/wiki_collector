function create_image_modal(){
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
        })
        // update ui
        location.reload();
    });

    // create image modal
    document.body.appendChild(create_image_modal())

}