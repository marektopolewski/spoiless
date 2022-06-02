// on extension installed
chrome.runtime.onInstalled.addListener(() => {
    chrome.storage.sync.set({

        // enable filtering by default
        filter: true,
        filter_mode: "whitelist", 

        // startng keywords to filtter on
        keywords: [
            {
                keyword: "software",
                active: true
            }
        ],

        // initial websites to whitelist and/or blacklist
        websites: [
            {
                url: "mtopolewski.com",
                whitelist: false,
                blacklist: true
            }
        ]
    });
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    // do not run the script if not a HTTP(S) webpage
    if (!/^http/.test(tab.url))
        return;

    chrome.storage.sync.get(
        ["filter", "filter_mode", "websites"],
        (props) => {
            if (!props.filter)
                return;

            // no filtering if mode whitelisting and webpage is whitelisted
            const website = props.websites.find(it => tab.url.includes(it.url));
            if (props.filter_mode === "whitelist" && website && website.whitelist)
                return;

            // no filtering if mode blacklisting and webpage is not blacklisted
            if (props.filter_mode === "blacklist" && website && !website.blacklist)
                return;
            
            // inject the filtering scropt if webpage is loading
            if (changeInfo.status === "loading") {
                chrome.scripting.executeScript({
                    target: { tabId: tabId },
                    files: ["filter.js"]
                });
            }
        }
    );
});

