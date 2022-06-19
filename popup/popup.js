let spoiler_toggle = document.getElementById("spoiler_toggle");
let spoiler_label = document.getElementById("spoiler_label");

let set_icon = (str) => {
    console.log("set_icon", str)
    chrome.action.setIcon({ path: {
        '16': `/images/spoiless_${str}_16.png`,
        '32': `/images/spoiless_${str}_32.png`,
        '48': `/images/spoiless_${str}_48.png`,
        '128': `/images/spoiless_${str}_128.png`,
    }})
};

let set_spoilter_toggle = (filter) => {
    set_icon(filter ? "red" : "green");
    spoiler_toggle.innerHTML = filter ? "Spoiless<br/>👍" : "Spoilfull<br/>😬";
    spoiler_toggle.value = filter;
    spoiler_toggle.classList.remove("filter-active");
    spoiler_toggle.classList.remove("filter-inactive");
    spoiler_toggle.classList.add("filter-" + (filter ? "active" : "inactive"));
    spoiler_label.innerText = filter ? "Spoilers are being filtered"
                                     : "Click the button to filter spoilers"
}

chrome.storage.sync.get("filter", ({ filter }) => {
    set_spoilter_toggle(filter);
});

chrome.storage.onChanged.addListener((changes, namespace) => {
    if (namespace !== "sync")
        return;
    for (let [key, { newValue }] of Object.entries(changes)) {
        if (key === "filter")
            set_spoilter_toggle(newValue);
    }
})

spoiler_toggle.addEventListener("click", () => {
    chrome.storage.sync.set({filter: !(spoiler_toggle.value === "true")});
    chrome.tabs.reload();
});

// Settings buttton
let settings_link = document.getElementById("settings_link");
settings_link.addEventListener("click", () => {
    chrome.runtime.openOptionsPage();
});
