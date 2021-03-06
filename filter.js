var is_excluded = (element) => {
    if (element.tagName === "STYLE")
        return true;
    if (element.tagName === "SCRIPT")
        return true;
    if (element.tagName === "NOSCRIPT")
        return true;
    if (element.tagName === "IFRAME")
        return true;
    if (element.tagName === "OBJECT")
        return true;
    return false
}

var has_background_image = (element) => {
    if (element.tagName !== "DIV")
        return false;

    const inline_bg_image = element.style.backgroundImage;
    if (inline_bg_image && inline_bg_image.length > 0)
        return true;

    const computed_bg_image = element.computedStyleMap().get("background-image");
    if (computed_bg_image) {
        const computed_bg_image_str = computed_bg_image.toString();
        if (computed_bg_image_str !== 'none' && /^url\(/.test(computed_bg_image_str))
            return true;
    }
    return false;
};

var set_style = (element, blur=10) => {
    element.classList.add("spoiless-hidden");
    element.style.cssText += `-webkit-filter: blur(${blur}px);`;
    element.style.cssText += `-moz-filter: blur(${blur}px);`;
    element.style.cssText += `-o-filter: blur(${blur}px);`;
    element.style.cssText += `-ms-filter: blur(${blur}px);`;
    element.style.cssText += `filter: blur(${blur}px);`;
}

var unset_style = (element) => {
    element.classList.remove("spoiless-hidden");
    element.classList.add("spoiless-shown");
    element.style.removeProperty("filter");
    element.style.removeProperty("-webkit-filter");
    element.style.removeProperty("-moz-filter");
    element.style.removeProperty("-o-filter");
    element.style.removeProperty("-ms-filter");
    element.style.removeProperty("filter");
}

var hide_element = (element) => {
    set_style(element);
    element.addEventListener("dblclick", (event) => {
        event.stopPropagation();
        event.preventDefault();
        unset_style(element);
    }, { once: true });
};

var traverse = (element, keywords, hide_callback) => {
    if (element.nodeType == Node.ELEMENT_NODE || element.nodeType == Node.DOCUMENT_NODE) {
        if (is_excluded(element))
            return;

        if (element.tagName == "IMG")
            hide_element(element);

        if (has_background_image(element))
            hide_element(element.parentNode);

        for (let it = 0; it < element.childNodes.length; it++)
            traverse(element.childNodes[it], keywords, () => { hide_element(element) });
    }

    else if (element.nodeType == Node.TEXT_NODE) {
        if (element.nodeValue.trim() === "")
            return; // empty text node
        for (const it of keywords) {
            if (element.nodeValue.toLowerCase().includes(it.keyword)) {
                hide_callback();
                break;
            }
        }
    }
}

var filter_element = (element) => {
    chrome.storage.sync.get("keywords", ({ keywords }) => {
        if (!keywords || keywords.length === 0)
            return;
        keywords = keywords.filter(it => it.active);
        if (keywords.length > 0)
            traverse(element, keywords, () => {});
    });
};

// Filter any changes to DOM https://stackoverflow.com/a/14570614/13171163
var observeDOM = (function () {
    var MutationObserver = window.MutationObserver || window.WebKitMutationObserver;
    return function (obj, callback) {
        if (!obj || obj.nodeType !== 1)
            return;
        if (MutationObserver) {
            var mutationObserver = new MutationObserver(callback)
            mutationObserver.observe(obj, { childList: true, subtree: true })
            return mutationObserver
        }
        else if (window.addEventListener) {
            obj.addEventListener('DOMNodeInserted', callback, false)
            obj.addEventListener('DOMNodeRemoved', callback, false)
        }
    }
})()


// Main

filter_element(document);

observeDOM(document.body, function (m) {
    m.forEach(record => {
        record.addedNodes.forEach(node => {
            filter_element(node);
        });
    });
});
