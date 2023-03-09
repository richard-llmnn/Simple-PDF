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

export {
    getHeightAndWidthFromImage
}
