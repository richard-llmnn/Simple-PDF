"use strict";

async function getHeightAndWidthFromImage(dataURL) {
    return new Promise(resolve => {
        const img = new Image()
        img.onload = () => {
            resolve({
                height: img.height,
                width: img.width
            })
        }
        img.src = dataURL
    });
}

function copyArrayBuffer(src)  {
    var dst = new ArrayBuffer(src.byteLength);
    new Uint8Array(dst).set(new Uint8Array(src));
    return dst;
}

export {
    getHeightAndWidthFromImage,
    copyArrayBuffer
}
