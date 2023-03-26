"use strict";

async function getHeightAndWidthFromImage(dataURL) {
    return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => {
            resolve({
                height: img.height,
                width: img.width,
            });
        };
        img.src = dataURL;
    });
}

function copyArrayBuffer(src) {
    const dst = new ArrayBuffer(src.byteLength);
    new Uint8Array(dst).set(new Uint8Array(src));
    return dst;
}

/**
 *
 * @param canvas HTMLCanvasElement
 * @param pdfPage PDFPage
 * @returns {Promise<void>}
 */
async function renderPdfToCanvas(canvas, pdfPage) {
    let pdfViewportOriginal = pdfPage.getViewport({ scale: 1 });
    let scale;

    let pdfWidth = pdfViewportOriginal.width;
    let pdfHeight = pdfViewportOriginal.height;
    if (pdfViewportOriginal.rotation % 180 !== 0) {
        [pdfWidth, pdfHeight] = [pdfHeight, pdfWidth];
    }

    if (pdfHeight > pdfWidth) {
        scale = 250 / pdfHeight;
    } else {
        scale = 250 / pdfWidth;
    }

    const context = canvas.getContext("2d");
    // clear canvas
    context.clearRect(0, 0, canvas.width, canvas.height);
    const pdfViewport = pdfPage.getViewport({ scale });
    canvas.height = pdfViewport.height;
    canvas.style.height = pdfViewport.height + "px";
    canvas.width = pdfViewport.width;
    canvas.style.width = pdfViewport.width + "px";

    pdfPage.render({
        canvasContext: context,
        viewport: pdfViewport,
    });
}

/**
 * translate to browser or given language
 * if lang === null, the browser language is used
 */
function t(translations = { de: "", en: "", zh: "", ru: "", fr: "" }, lang = null) {
    const fallbackLanguage = "de";

    if (lang === null) {
        /**
         * @description get language code in lower case
         * @example en-US -> en, EN-GB -> en, de -> de
         */
        const browserLanguageCode = navigator.language.slice(0, 2).toLocaleLowerCase();

        if (Object.keys(translations).includes(browserLanguageCode)) {
            return translations[browserLanguageCode];
        }
    } else {
        if (Object.keys(translations).includes(lang)) {
            return translations[lang];
        }
    }

    return translations[fallbackLanguage];
}

export { getHeightAndWidthFromImage, copyArrayBuffer, renderPdfToCanvas, t };
