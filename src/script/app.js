import * as pdfjsLib from "pdfjs-dist/webpack";
import { PDFDocument, degrees, PageSizes } from "pdf-lib";
import { Sortable } from "@shopify/draggable";
import Dropzone from "dropzone";
import { handlePdf, handlePng, handleJpeg } from "./fileHandlers";
import { copyArrayBuffer, renderPdfToCanvas } from "./helperFunctions";
import { Modal } from "bootstrap";

const previewModelSelector = "#previewModal";
const previewZoomIntBtn = document.getElementById("preview-zoom-int-btn");
const previewZoomOutBtn = document.getElementById("preview-zoom-out-btn");
const container = document.querySelector("#drag-area");

let pageCounter = 1;
let pagesObject = {};
let filesCounter = 1;
let filesObject = {};
let previewScale = 1;

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
            <div class="card-footer p-0 d-flex align-items-stretch">
                <button class="btn btn-danger m-0 no-border-radius flex-grow-1" onclick="removePage(${page})">
                    <i class="gg-trash mx-auto"></i>
                </button>
                <button class="btn btn-info m-0 no-border-radius flex-grow-1" onclick="rotatePage(${page})">
                    <i class="gg-redo mx-auto"></i>
                </button>
                <button class="btn btn-warning m-0 no-border-radius flex-grow-1" onclick="resizePage(${page})">
                    <i style="position:relative;top:4px;right:4px;"class="gg-expand mx-auto"></i>
                </button>
            </div>
        </div>
        `;
    return container.firstElementChild;
};

const templateHr = (content) => {
    const container = document.createElement("span");
    container.innerHTML = `
        <div class="align-items-center d-flex w-100 gap-1 user-select-none">
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

    return await finalPDF.save({ addDefaultPage: false });
}

window.resizePage = async function (pageID) {
    const pageInformation = pagesObject[pageID];
    const pdfDocument = await PDFDocument.load(filesObject[pageInformation.pdfIndex]);
    const page = pdfDocument.getPage(pageInformation.pageIndex - 1);
    const modalElement = document.getElementById("resizeModal");
    const myModal = new Modal(modalElement);
    myModal.show();

    const widthElement = document.querySelector("#resizeModal #width");
    const heightElement = document.querySelector("#resizeModal #height");
    const pageSize = page.getSize();
    widthElement.value = pageSize.width.toFixed(2);
    heightElement.value = pageSize.height.toFixed(2);

    const select = document.querySelector("#resizeModal select");
    Object.entries(PageSizes).forEach(([size, measurement]) => {
        const option = document.createElement("option");
        option.value = size;
        option.innerText = `${size} (${measurement.join("pt x ")}pt)`;
        select.appendChild(option);
        if (measurement[0] == pageSize.width.toFixed(2) && measurement[1] == pageSize.height.toFixed(2)) {
            select.value = size;
        }
    });

    const keepAspectRatio = document.querySelector("#keepAspectRatio");
    let aspectRatio = pageSize.width / pageSize.height;

    keepAspectRatio.oninput = () => {
        aspectRatio = widthElement.value / heightElement.value;
    };

    widthElement.oninput = () => {
        if (keepAspectRatio.checked) {
            heightElement.value = (widthElement.value / aspectRatio).toFixed(2);
        }
    };
    heightElement.oninput = () => {
        if (keepAspectRatio.checked) {
            widthElement.value = (heightElement.value * aspectRatio).toFixed(2);
        }
    };

    select.onchange = () => {
        if (!select.value) return;
        aspectRatio = widthElement.value / heightElement.value;
        widthElement.value = PageSizes[select.value][0];
        if (keepAspectRatio.checked) {
            heightElement.value = (widthElement.value / aspectRatio).toFixed(2);
        } else {
            heightElement.value = PageSizes[select.value][1];
        }
    };

    const closeModalElement = document.getElementById("resizeModalClose");
    closeModalElement.onclick = async () => {
        page.setSize(parseFloat(widthElement.value), parseFloat(heightElement.value));
        filesObject[pageInformation.pdfIndex] = (await pdfDocument.save()).buffer;
        const pageElement = document.querySelector('div[data-page-id="' + pageID + '"]');
        renderPdfToCanvas(
            pageElement.querySelector(".card-body canvas"),
            copyArrayBuffer(filesObject[pageInformation.pdfIndex]),
            pageInformation.pageIndex
        ).then(() => {
            alert(
                `Die Größe von Seite ${pageID} wurde erfolgreich angepasst | Page ${pageID} was successfully resized`
            );
        });
    };
};

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
window.previewPDF = async function () {
    const modalElement = document.querySelector(previewModelSelector);
    const modalBody = modalElement.querySelector(".modal-body");
    modalBody.innerHTML = null; // clear modal
    const pdfObject = await pdfjsLib.getDocument(await getFinalArrayBuffer()).promise;

    for (let pageId = 1; pageId <= pdfObject.numPages; pageId++) {
        const page = await pdfObject.getPage(pageId);
        const viewport = page.getViewport({ scale: previewScale });

        const canvas = document.createElement("canvas");
        const canvasContext = canvas.getContext("2d");
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        canvas.classList.add("single-page-canvas", "mx-auto");
        modalBody.appendChild(templateHr(pageId));
        modalBody.appendChild(canvas);

        const renderContext = {
            canvasContext,
            viewport,
        };
        page.render(renderContext);
    }
};

window.previewPDFZoomIn = function (button) {
    toggleZoomButtons();
    if (previewScale < 5) previewScale += 0.1;
    previewPDF().then(() => {
        toggleZoomButtons();
    });
};

window.previewPDFZoomOut = function (button) {
    toggleZoomButtons();
    if (previewScale > 0.1) previewScale -= 0.1;
    previewPDF().then(() => {
        toggleZoomButtons();
    });
};
function toggleZoomButtons() {
    previewZoomIntBtn.disabled = !previewZoomOutBtn.disabled;
    previewZoomOutBtn.disabled = !previewZoomOutBtn.disabled;
}
