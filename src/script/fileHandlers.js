"use strict";

import { PDFDocument } from "pdf-lib";
import { getHeightAndWidthFromImage } from "./helperFunctions";

async function handleJpeg(file) {
  const tempFile = await PDFDocument.create();
  const jpgImageTemp = await tempFile.embedJpg(await file.arrayBuffer());
  const imageDimensions = await getHeightAndWidthFromImage(
    URL.createObjectURL(file)
  );
  const page1Temp = tempFile.addPage([
    imageDimensions.width,
    imageDimensions.height,
  ]);
  page1Temp.drawImage(jpgImageTemp, {
    x: 0,
    y: 0,
    height: imageDimensions.height,
    width: imageDimensions.width,
  });

  return (await tempFile.save()).buffer;
}

async function handlePng(file) {
  const tempFile = await PDFDocument.create();
  const pdfImageTemp = await tempFile.embedPng(await file.arrayBuffer());
  const imageDimensions = await getHeightAndWidthFromImage(
    URL.createObjectURL(file)
  );
  const page1Temp = tempFile.addPage([
    imageDimensions.width,
    imageDimensions.height,
  ]);
  page1Temp.drawImage(pdfImageTemp, {
    x: 0,
    y: 0,
    height: imageDimensions.height,
    width: imageDimensions.width,
  });

  return (await tempFile.save()).buffer;
}

async function handlePdf(file) {
  return await file.arrayBuffer();
}

export { handleJpeg, handlePdf, handlePng };
