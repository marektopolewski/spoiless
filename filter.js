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
    return false;
}

var has_background_image = (element) => {
    if (element.tagName !== "DIV")
        return false;

    const inline_bg_image = element.style.backgroundImage;
    if (inline_bg_image && inline_bg_image.length > 0)
        return true;

    const computed_bg_image = element.computedStyleMap().get("background-image").toString();
    if (computed_bg_image !== 'none' && /^url\(/.test(computed_bg_image))
        return true;

    return false;
};

var set_style = (element, blur=10) => {
    element.classList.add("spoiless-hidden");
    element.style.cssText += `-webkit-filter: blur(${blur}px);`;
    element.style.cssText += `-moz-filter: blur(${blur}px);`;
    element.style.cssText += `-o-filter: blur(${blur}px);`;
    element.style.cssText += `-ms-filter: blur(${blur}px);`;
    element.style.cssText += `filter: blur(${blur}px);`;
    element.addEventListener("click", (event) => {
        event.stopPropagation();
        let parent = element.parentNode;
        let child = element.childNodes[0];
        child.classList.add("spoiless-shown");
        parent.replaceChild(child, element);
    });
}

// var unset_style = (element) => {
//     element.classList.remove("spoiless-hidden");
//     element.style.removeProperty("filter");
//     element.style.removeProperty("-webkit-filter");
//     element.style.removeProperty("-moz-filter");
//     element.style.removeProperty("-o-filter");
//     element.style.removeProperty("-ms-filter");
//     element.style.removeProperty("filter");
// }

// TODO: consider adding a wrapper div instead - might fix click propagation
// var hide_element_2 = (element) => {
//     set_style(element);
//     element.addEventListener("click", (event) => {
//         event.preventDefault();
//         event.stopPropagation();
//         unset_style(element);
//     }, { once: true });
// };

var hide_element = (element, extra_wrap=false) => {
    let parent = element.parentNode;
    let wrapper = document.createElement("div");
    if (extra_wrap) {
        let extra_wrapper = document.createElement("div");
        parent.replaceChild(wrapper, element);
        wrapper.appendChild(extra_wrapper);
        extra_wrapper.appendChild(element);
    } else {
        parent.replaceChild(wrapper, element);
        wrapper.appendChild(element);
    }
    set_style(wrapper);
};

var traverse = (element, keywords) => {
    if (element.nodeType == Node.ELEMENT_NODE || element.nodeType == Node.DOCUMENT_NODE) {
        if (is_excluded(element))
            return;

        if (element.tagName == "IMG" || has_background_image(element))
            hide_element(element);

        for (let it = 0; it < element.childNodes.length; it++)
            traverse(element.childNodes[it], keywords);
    }

    else if (element.nodeType == Node.TEXT_NODE) {
        if (element.nodeValue.trim() === "")
            return; // empty text node

            hide_element(element, extra_wrap=true);
        // for (const it of keywords) {
        //     if (element.nodeValue.toLowerCase().includes(it.keyword)) {
        //         hide_element(element, extra_wrap=true);
        //         break;
        //     }
        // }
    }
}

var filter_element = (element) => {
    chrome.storage.sync.get("keywords", ({ keywords }) => {
        if (!keywords || keywords.length === 0)
            return;
        keywords = keywords.filter(it => it.active);
        if (keywords.length > 0)
            traverse(element, keywords);
    });
};

filter_element(document);

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

var is_hidden = (element) => {
    const parent_class_list = element.parentNode.classList;
    const this_class_list = element.classList;
    return (parent_class_list && parent_class_list.contains("spoiless-hidden")) 
            || this_class_list.contains("spoiless-hidden");
}

var is_shown = (element) => {
    return element.classList.contains("spoiless-shown");
}

observeDOM(document.body, function (m) {
    m.forEach(record => {
        record.addedNodes.forEach(node => {
            if (is_hidden(node) || is_shown(node))
                return;
            console.log("new node", node)
            filter_element(node);
        });
    });
});
