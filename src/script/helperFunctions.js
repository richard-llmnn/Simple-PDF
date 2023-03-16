"use strict";

import * as pdfjsLib from "pdfjs-dist/webpack";

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

async function renderPdfToCanvas(canvas, arrayBuffer, pageId) {
  const context = canvas.getContext("2d");

  const pdfDoc = await pdfjsLib.getDocument(arrayBuffer).promise; // array buffer(file) to object
  const pdfPage = await pdfDoc.getPage(pageId); // get specific page from file
  let pdfViewportOriginal = pdfPage.getViewport({ scale: 1 });
  let scale = 1;

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

export { getHeightAndWidthFromImage, copyArrayBuffer, renderPdfToCanvas };
