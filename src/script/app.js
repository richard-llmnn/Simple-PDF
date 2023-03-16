import * as pdfjsLib from "pdfjs-dist/webpack";
import { PDFDocument, degrees } from "pdf-lib";
import { Sortable } from "@shopify/draggable";
import Dropzone from "dropzone";
import { handlePdf, handlePng, handleJpeg } from "./fileHandlers";
import { copyArrayBuffer, renderPdfToCanvas } from "./helperFunctions";

let pageCounter = 1;
let pagesObject = {};
let filesCounter = 1;
let filesObject = {};

const container = document.querySelector("#drag-area");

// make html elements draggable
const drag = new Sortable(container, {
    draggable: ".card-auto-size",
    handle: ".card-body",
});

let myDropzone = new Dropzone("#dropzone", {
    autoProcessQueue: false,
    url: "#",
    acceptedFiles: ".pdf,.jpg,.jpeg,.png",
    uploadMultiple: true,
    dictDefaultMessage: "Dateien zum Hochladen hier ablegen / Drop files here to upload<br>( .pdf, .png, .jpg, .jpeg )",
});

myDropzone.on("addedfiles", async (files) => {
    for (const file of files) {
        try {
            await processFile(file);
        } catch (e) {
            alert(e.message);
        }
    }
    myDropzone.removeAllFiles();
});

const template = (page, fileName = null) => {
    const container = document.createElement("span");
    container.innerHTML = `
        <div class="card card-auto-size" data-page-id="${page}">
            <div class="card-header bg-warning p-1 text-center user-select-none"><b>${page}</b></div>
            ${fileName !== null ? `<div class="card-header bg-warning p-1 text-center">(${fileName})</div>` : ""}
            <div class="card-body p-0 d-flex justify-content-center align-items-center bg-black">
                <canvas class="d-block"></canvas>
            </div>
            <div class="card-footer p-0 d-flex">
                <button class="btn btn-danger w-50 m-0 no-border-radius" onclick="removePage(${page})"><i class="gg-trash mx-auto"></i></button>
                <button class="btn btn-info w-50 m-0 no-border-radius" onclick="rotatePage(${page})"><i class="gg-redo mx-auto"></i></button>
            </div>
        </div>
        `;
    return container.firstElementChild;
};

const templateHr = (content) => {
    const container = document.createElement("span");
    container.innerHTML = `
        <div class="align-items-center d-flex w-100 gap-1">
            <hr class="flex-grow-1"><b>${content}</b><hr class="flex-grow-1">
        </div>
        `;
    return container.firstElementChild;
};


// is called for each uploaded file
async function processFile(file) {
    //myDropzone.element.classList.add("d-none");
    myDropzone.emit("uploadprogress", file, 0);
    switch (file.type) {
        case "application/pdf":
            filesObject[filesCounter] = await handlePdf(file);
            break;
        case "image/jpeg":
            filesObject[filesCounter] = await handleJpeg(file);
            break;
        case "image/png":
            filesObject[filesCounter] = await handlePng(file);
            break;
        default:
            myDropzone.removeFile(file);
            alert("Keine PDF-Dateien! | Invalid PDF file!");
            return;
    }

    const pdfFile = filesObject[filesCounter];
    let pdfDoc = await pdfjsLib.getDocument(copyArrayBuffer(pdfFile)).promise;
    const pageAmount = pdfDoc.numPages;
    pdfDoc = undefined;
    for (let pageIndex = 1; pageIndex <= pageAmount; pageIndex++) {
        myDropzone.emit("uploadprogress", file, Math.round((pageIndex / pageAmount) * 100));

        const card = template(pageCounter, "name" in file ? file.name : null);
        container.insertAdjacentElement("beforeend", card);

        renderPdfToCanvas(card.querySelector(".card-body canvas"), copyArrayBuffer(pdfFile), pageIndex);

        pagesObject[pageCounter] = {
            pageIndex: pageIndex,
            pdfIndex: filesCounter,
        };
        pageCounter++;
    }
    filesCounter++;
}

window.removePage = function (pageID) {
    const page = document.querySelector('div[data-page-id="' + pageID + '"]');
    if (page && confirm(`Seite ${pageID} entfernen? | Remove page ${pageID}?`) === true) {
        page.remove();
        delete pagesObject[pageID];
    }
};

window.resetPage = function () {
    if (confirm("Zurücksetzen? | Reset?")) {
        location.reload();
    }
};

window.rotatePage = async function (pageID) {
    const pageElement = document.querySelector('div[data-page-id="' + pageID + '"]');
    // load pdf file and get page
    const pageInformation = pagesObject[pageID];
    const pdfDocument = await PDFDocument.load(filesObject[pageInformation.pdfIndex]);
    const page = pdfDocument.getPage(pageInformation.pageIndex - 1);
    // add 90 degrees
    const newRotationAngle = (page.getRotation().angle + 90) % 360;
    page.setRotation(degrees(newRotationAngle));
    // save new pdf file as array buffer
    filesObject[pageInformation.pdfIndex] = (await pdfDocument.save()).buffer;

    // rerender canvas
    renderPdfToCanvas(
        pageElement.querySelector(".card-body canvas"),
        copyArrayBuffer(filesObject[pageInformation.pdfIndex]),
        pageInformation.pageIndex
    ).then(() => {
        alert(`Seite ${pageID} wurde erfolgreich gedreht | Page ${pageID} was successfully rotated`);
    });
};

async function getFinalArrayBuffer() {
    // merge pdfs
    const pdfDocumentCache = {};
    const finalPDF = await PDFDocument.create();
    const pagesElements = document.querySelector("#drag-area").querySelectorAll("div[data-page-id]");
    for (const pageElement of pagesElements) {
        const pageId = pageElement.dataset.pageId;
        const page = pagesObject[pageId];
        if (!pdfDocumentCache.hasOwnProperty(page.pdfIndex)) {
            pdfDocumentCache[page.pdfIndex] = await PDFDocument.load(filesObject[page.pdfIndex]);
        }
        finalPDF.addPage((await finalPDF.copyPages(pdfDocumentCache[page.pdfIndex], [page.pageIndex - 1]))[0]);
    }

    return await finalPDF.save({addDefaultPage: false});
}

window.savePDF = async function () {
    // ask user for new file name
    let downloadFileName = prompt("[Dateiname/Filename].pdf");
    if (downloadFileName === null || downloadFileName === "" || downloadFileName.trim().length < 1) {
        alert("Dateiname nicht gültig! | Filename not valid!");
        return;
    }

    // generate and download blob
    const pdf = new Blob([await getFinalArrayBuffer()], {
        type: "application/pdf",
    });

    let link = document.createElement("a");
    link.download = downloadFileName + ".pdf";
    const objectUrl = URL.createObjectURL(pdf);
    link.href = objectUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(objectUrl);
};

/**
 * @param button HTMLElement
 * @returns {Promise<void>}
 */
window.previewPDF = async function(button) {
    const modalElement = document.querySelector(button.dataset.bsTarget);
    const modalBody = modalElement.querySelector('.modal-body')
    const pdfObject = await pdfjsLib.getDocument(await getFinalArrayBuffer()).promise;

    for (let pageId = 1; pageId <= pdfObject.numPages; pageId++) {
        const page = await pdfObject.getPage(pageId)
        const viewport = page.getViewport({scale: 1});

        const canvas = document.createElement("canvas")
        const canvasContext = canvas.getContext("2d")
        canvas.width = viewport.width;
        canvas.height = viewport.height
        canvas.classList.add("single-page-canvas")
        modalBody.appendChild(templateHr(pageId))
        modalBody.appendChild(canvas)

        const renderContext = {
            canvasContext,
            viewport
        }
        page.render(renderContext)
    }
}
