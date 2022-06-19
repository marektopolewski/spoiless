
/******************************* FILTER TOGGLE *******************************/
let filter_toggle = document.getElementById("filter_toggle");
let set_icon = (str) => {
    console.log("set_icon", str)
    chrome.action.setIcon({ path: {
        '16': `/images/spoiless_${str}_16.png`,
        '32': `/images/spoiless_${str}_32.png`,
        '48': `/images/spoiless_${str}_48.png`,
        '128': `/images/spoiless_${str}_128.png`,
    }})
};
let set_filter_toggle = (filter) => {
    set_icon(filter ? "red" : "green");
    filter_toggle.innerText = filter ? "ACTIVE" : "INACTIVE";
    filter_toggle.value = filter;
    filter_toggle.style.backgroundColor = filter ? "rgb(191, 33, 33)" : "rgb(40, 144, 54)";
};

chrome.storage.sync.get("filter", ({ filter }) => {
    set_filter_toggle(filter);
});

filter_toggle.addEventListener("click", (event) => {
    chrome.storage.sync.set({ filter: !(filter_toggle.value === "true") });
});

/******************************* KEYWORDS LIST *******************************/
let keywords_list = document.getElementById("keywords_list");

let make_keyword_label = (item) => {
    let label = document.createElement("label");
    label.innerText = item.keyword;
    label.setAttribute("for", item.keyword + "_checkbox");
    return label;
};

let make_keyword_checkbox = (item, keywords) => {
    let checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.id = item.keyword + "_checkbox";
    checkbox.checked = item.active;
    checkbox.classList.add("keyword_active_checkbox");
    checkbox.addEventListener("click", (event) => {
        event.preventDefault();
        const idx = keywords.findIndex((x => x.keyword === item.keyword));
        keywords[idx].active = checkbox.checked;
        chrome.storage.sync.set({ keywords: keywords });
    });
    return checkbox;
};

let make_keyword_delete = (item, keywords) => {
    let button = document.createElement("button");
    button.type = "button";
    button.innerText = "🗑";
    button.classList.add("keyword_delete_button");
    button.addEventListener("click", (event) => {
        idx = keywords.findIndex((x => x.keyword === item.keyword));
        keywords.pop(idx);
        chrome.storage.sync.set({ keywords: keywords });
    });
    return button;
};

let set_keywords_list = (keywords) => {
    keywords_list.innerHTML = ""; // clear children
    for (let item of keywords) {
        let div = document.createElement("div");
        div.classList.add("keyword_div");
        keywords_list.appendChild(div);
        div.appendChild(make_keyword_label(item));
        div.appendChild(make_keyword_checkbox(item, keywords));
        div.appendChild(make_keyword_delete(item, keywords));
    }
};

chrome.storage.sync.get("keywords", ({ keywords }) => {
    set_keywords_list(keywords);
});

/******************************* WEBSITE LIST ********************************/
let website_list = document.getElementById("website_list");

let make_website_label = (item) => {
    let link = document.createElement("a");
    link.innerText = item.url.toLowerCase();
    link.href = "#";
    return link;
};

let make_xlist_checkbox = (item, xlist, websites) => {
    if (xlist !== "whitelist" && xlist !== "blacklist")
        return null;
    let div = document.createElement("div");
    div.classList.add("website_" + xlist + "_div")
    let label = document.createElement("label");
    label.innerText = xlist;
    div.appendChild(label);
    let checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.id = item.url + "_" + xlist + "_checkbox";
    checkbox.checked = item[xlist];
    checkbox.classList.add("website_xlist_checkbox");
    checkbox.addEventListener("click", (event) => {
        event.preventDefault();
        const idx = websites.findIndex((x => x.url === item.url));
        websites[idx][xlist] = checkbox.checked;
        chrome.storage.sync.set({ websites: websites });
    });
    div.appendChild(checkbox);
    return div;
};

let make_xlist_div = (item, websites) => {
    let div = document.createElement("div");
    div.classList.add("website_xlist_div");
    div.appendChild(make_xlist_checkbox(item, "whitelist", websites));
    div.appendChild(make_xlist_checkbox(item, "blacklist", websites));
    return div;
};

let make_website_delete = (item, websites) => {
    let button = document.createElement("button");
    button.type = "button";
    button.innerText = "🗑";
    button.classList.add("website_delete_button");
    button.addEventListener("click", (event) => {
        const idx = websites.findIndex((x => x.url === item.url));
        websites.pop(idx);
        chrome.storage.sync.set({ websites: websites });
    });
    return button;
};

let set_website_list = (websites) => {
    website_list.innerHTML = ""; // clear children
    for (let item of websites) {
        let div = document.createElement("div");
        div.classList.add("website_div");
        website_list.appendChild(div);
        div.appendChild(make_website_label(item));
        let button_div = document.createElement("div");
        button_div.classList.add("website_button_div");
        button_div.appendChild(make_xlist_div(item, websites));
        button_div.appendChild(make_website_delete(item, websites));
        div.appendChild(button_div);
    }
};

chrome.storage.sync.get("websites", ({ websites }) => {
    set_website_list(websites);
});

/**************************** "ADD NEW" BUTTONS ******************************/
let add_website_button = document.getElementById("add_website_button");
let add_website_textarea = document.getElementById("add_website_textarea");

let add_website = (new_website) => {
    if (!new_website || new_website === "")
        return;
    chrome.storage.sync.get("websites", ({ websites }) => {
        const idx = websites.findIndex((x => x.url === new_website));
        if (idx !== -1) {
            alert("Website " + new_website + " is already in the list!")
            return;
        }
        websites.push({
            url: new_website,
            whitelist: false,
            blacklist: false
        });
        chrome.storage.sync.set({ websites: websites });
    });
}

add_website_textarea.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
        event.preventDefault();
        add_website(add_website_textarea.value.toLowerCase());
        add_website_textarea.value = "";
    }
});
add_website_button.addEventListener("click", (event) => {
    add_website(add_website_textarea.value.toLowerCase());
    add_website_textarea.value = "";
});

let add_keyword_button = document.getElementById("add_keyword_button");
let add_keyword_textarea = document.getElementById("add_keyword_textarea");

let add_keyword = (new_keyword) => {
    if (!new_keyword || new_keyword === "")
        return;
    chrome.storage.sync.get("keywords", ({ keywords }) => {
        const idx = keywords.findIndex((x => x.keyword === new_keyword));
        if (idx !== -1) {
            alert("Keyword " + new_keyword + " is already in the list!")
            return;
        }
        keywords.push({
            keyword: new_keyword,
            active: true
        });
        chrome.storage.sync.set({ keywords: keywords });
    });
};

add_keyword_button.addEventListener("click", (event) => {
    add_keyword(add_keyword_textarea.value.toLowerCase());
    add_keyword_textarea.value = "";
});
add_keyword_textarea.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
        event.preventDefault();
        add_keyword(add_keyword_textarea.value.toLowerCase());
        add_keyword_textarea.value = "";
    }
});

/*************************** WEBSITE FILTER MDOE *****************************/
let website_filter_mode = document.getElementById("website_filter_mode");

let set_website_filter_mode = (filter_mode) => {
    const whitelisting = filter_mode === "whitelist";
    website_filter_mode.innerText = whitelisting ? "WHITELIST" : "BLACKLIST";
    website_filter_mode.value = filter_mode;
    website_filter_mode.style.backgroundColor = whitelisting ? "white" : "black";
    website_filter_mode.style.color = whitelisting ? "black" : "white";
};

chrome.storage.sync.get("filter_mode", ({ filter_mode }) => {
    set_website_filter_mode(filter_mode);
});

website_filter_mode.addEventListener("click", (event) => {
    const new_filter_mode = website_filter_mode.value === "whitelist" ? "blacklist" : "whitelist";
    chrome.storage.sync.set({ filter_mode: new_filter_mode });
});

/*****************************************************************************/

// Listen to configuration updates
chrome.storage.onChanged.addListener((changes, namespace) => {
    if (namespace !== "sync")
        return;
    for (let [key, { newValue }] of Object.entries(changes)) {
        if (key === "filter")
            set_filter_toggle(newValue);
        if (key === "filter_mode")
            set_website_filter_mode(newValue);
        if (key === "keywords")
            set_keywords_list(newValue);
        if (key === "websites")
            set_website_list(newValue);
    }
});
