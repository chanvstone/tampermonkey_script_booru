// ==UserScript==
// @name         Booru Downloader
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  download pictures easilier
// @author       SiO2
// @match        https://gelbooru.com/index.php?page=post&s=list*
// @match        https://gelbooru.com/index.php?page=post&s=view*
// @updateURL    https://github.com/chanvstone/tampermonkey_script_booru/raw/main/src/script/booru.user.js
// @downloadURL  https://github.com/chanvstone/tampermonkey_script_booru/raw/main/src/script/booru.user.js
// @supportURL   https://github.com/chanvstone/tampermonkey_script_booru
// @grant        unsafeWindow
// @grant        Subresource Integrity
// @grant        GM_addStyle
// @grant        GM_addElement
// @grant        GM_deleteValue
// @grant        GM_listValues
// @grant        GM_addValueChangeListener
// @grant        GM_removeValueChangeListener
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_log
// @grant        GM_getResourceText
// @grant        GM_getResourceURL
// @grant        GM_registerMenuCommand
// @grant        GM_unregisterMenuCommand
// @grant        GM_xmlhttpRequest
// @grant        GM_download
// @grant        GM_getTab
// @grant        GM_saveTab
// @grant        GM_getTabs
// @grant        GM_notification
// @grant        GM_setClipboard
// @grant        GM_info
// @run-at       document-idle
// ==/UserScript==

class Download {
    /**
     * build download button
     * @param {string} id id of post
     * @param {string} url file_url of post
     */
    constructor(id, url) {
        this.id = id;
        this.url = url;
        this.makeFileName();
    }
    /**
     * load style of download button
     */
    static loadStyle() {
        GM_addStyle("button.download{width:90%;height:15%;border:none;border-radius:16px;position:relative;display:flex;flex-flow:column;justify-content:center;align-items:center;}div.progress-list{position:absolute;border-radius:16px;left:0;top:0;margin:0px;padding:0px;height:100%;width:0%;background-color:rgba(0,0,255,0.2);}div.progress-view{position:absolute;left:0;bottom:0;margin:0px;padding:0px;height:0%;width:100%;background-color:rgba(0,0,255,0.2);}");
    }
    /**
     * insert download button into parent for post list
     * @param {Element} parent element that button insert into
     */
    insertButton4List(parent) {
        this.button = document.createElement("button");
        this.progress = document.createElement("div");
        this.button.textContent = "下载";
        this.button.className = "download";
        this.progress.className = "progress-list";
        this.button.append(this.progress);
        this.button.addEventListener("click", (ev) => {
            GM_download({
                url: this.url,
                name: this.fileName,
                onprogress: (ev) => {
                    this.progress.style.width = ((ev.loaded / ev.total) * 100) + "%";
                },
                onload: (ev) => {
                    this.progress.style.backgroundColor = "rgba(0,255,0,0.2)";
                }
            })
        });
        parent.append(this.button);
    }
    /**
     * insert download button into parent for post view
     * @param {Element} parent element that button insert into
     */
    insertButton4View(parent) {
        this.progress = document.createElement("div");
        this.progress.className = "progress-view";
        parent.addEventListener("click", (ev) => {
            GM_download({
                url: this.url,
                name: this.fileName,
                onprogress: (ev) => {
                    this.progress.style.height = ((ev.loaded / ev.total) * 100) + "%";
                },
                onload: (ev) => {
                    this.progress.style.backgroundColor = "rgba(0,255,0,0.2)";
                }
            })
        });
        parent.append(this.progress);
    }
    /**
     * make file name by id and file_url
     * @param {string} id id of post
     * @param {string} url file_url of post
     * @returns file name "id.type"
     */
    makeFileName() {
        let type = /[a-z0-9]{32}(\.[a-z0-9]+)$/.exec(this.url)[1]
        this.fileName = this.id + type;
    }
}

class Booru {
    loadStyle() { }
    mod() { }
    mod4List() { }
    mod4View() { }
}

class Gel extends Booru {
    /**
     * GelBooru
     * @param {string} url url of current page
     */
    constructor(url) {
        super();
        this.url = url;
    }
    /**
     * load style
     */
    loadStyle() {
        GM_addStyle(".thumbnail-preview{height:215px;justify-content:space-between;flex-direction:column;}.fit-width{width:auto!important;height:95vh!important;}");
    }
    /**
     * do mod
     */
    mod() {
        if (this.url.includes("s=list")) {
            this.mod4List();
        } else if (this.url.includes("s=view")) {
            this.mod4View();
        }
    }
    mod4List() {
        document.querySelectorAll("article.thumbnail-preview").forEach((value, key, parent) => {
            let aElement = value.querySelector("a");
            let id = aElement.getAttribute("id").substr(1, 10);
            let xhr = new XMLHttpRequest();
            xhr.addEventListener("load", (ev) => {
                let download = new Download(id, ev.target.responseXML.querySelector("post").getAttribute("file_url"));
                download.insertButton4List(value);
            });
            xhr.open("GET", "https://gelbooru.com/index.php?page=dapi&s=post&q=index&id=" + id);
            xhr.send();
        })
    }
    mod4View() {
        let aOriginal = document.querySelector("li>a[target=_blank][rel=noopener]");
        let url = aOriginal.getAttribute("href");
        let sectionElement = document.querySelector("section.image-container");
        let id = sectionElement.getAttribute("data-id");
        let download = new Download(id, url);
        download.insertButton4View(sectionElement);
    }
}

class Dan extends Booru {
    // todo
}

Download.loadStyle();
let pageUrl = document.URL;
if (pageUrl.includes("gelbooru.com")) {
    let gel = new Gel(pageUrl);
    gel.loadStyle();
    gel.mod();
} else if (pageUrl.includes("danbooru.donmai.us")) {
    let dan = new Dan();
    dan.loadStyle();
    dan.mod();
}