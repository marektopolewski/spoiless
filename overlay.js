document.addEventListener('DOMContentLoaded', () => {
    console.log('overlay')
    let overlay = document.createElement("div");
    overlay.id = "spoiless-overlay";
    overlay.style.cssText = `
        position: fixed;
        display: block;
        width: 100%; height: 100%;
        top: 0; left: 0; right: 0; bottom: 0;
        z-index: 999999;
        cursor: pointer;
        backdrop-filter: saturate(180%) blur(20px);
        -webkit-backdrop-filter: saturate(180%) blur(20px);
    `;
    // document.body.appendChild(overlay);
});
