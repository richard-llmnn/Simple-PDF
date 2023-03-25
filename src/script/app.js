import * as pdfjsLib from "pdfjs-dist/webpack";
import { PDFDocument, degrees, PageSizes } from "pdf-lib";
import { Sortable } from "@shopify/draggable";
import Dropzone from "dropzone";
import { handlePdf, handlePng, handleJpeg } from "./fileHandlers";
import { copyArrayBuffer, renderPdfToCanvas, t } from "./helperFunctions";
import { Modal } from "bootstrap";

const previewModelSelector = "#previewModal";
const previewZoomIntBtn = document.getElementById("preview-zoom-int-btn");
const previewZoomOutBtn = document.getElementById("preview-zoom-out-btn");
const container = document.querySelector("#drag-area");

let pageCounter = 1;
let pagesObject = {};
let originalSizesObject = {};
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
    dictDefaultMessage: t({
        de: "Dateien zum Hochladen hier ablegen",
        en: "Drop files here to upload",
        zh: "将文件放在这里上传",
        ru: "Загрузите свои файлы сюда",
        fr: "Déposer ici les fichiers à télécharger"
    }) + "<br>( .pdf, .png, .jpg, .jpeg )",
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
            alert(t({
                de: "Keine PDF-Dateien!",
                en: "Invalid PDF file!",
                ru: "Неверный файл PDF!",
                zh: "无效的PDF文件!",
                fr: "Fichier PDF non valide !"
            }));
            return;
    }
    const filename = "name" in file ? file.name : null;

    const pdfFile = filesObject[filesCounter];
    let pdfDoc = await pdfjsLib.getDocument(copyArrayBuffer(pdfFile)).promise;
    const pageAmount = pdfDoc.numPages;

    if (pageAmount > 20) {
        const translation = t({
            de: `Möchtest du wirklich ${pageAmount} Seiten der Datei "${filename}" importieren?`,
            en: `Do you really want to import ${pageAmount} pages from the file "${filename}"?`,
            fr: `Tu veux vraiment importer ${pageAmount} pages du fichier "${filename}" ?`,
            zh: `你真的想从文件"${filename}"中导入${pageAmount}页吗？`,
            ru: `Вы действительно хотите импортировать ${pageAmount} страниц из файла "${filename}"?`
        });
        if (!confirm(translation)) {
            filesObject[filesCounter] = undefined
            return;
        }
    }

    pdfDoc = undefined;
    for (let pageIndex = 1; pageIndex <= pageAmount; pageIndex++) {
        myDropzone.emit("uploadprogress", file, Math.round((pageIndex / pageAmount) * 100));

        const card = template(pageCounter, filename);
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
    const translation = t({
        de: `Seite ${pageID} entfernen?`,
        en: `Remove page ${pageID}?`,
        ru: `Удалить страницу ${pageID}?`,
        fr: `Supprimer la page ${pageID} ?`,
        zh: `移除页面${pageID}?`
    });
    if (page && confirm(translation) === true) {
        page.remove();
        delete originalSizesObject[pageID];
        delete pagesObject[pageID];
    }
};

window.resetPage = function () {
    const translation = t({
        de: "Zurücksetzen?",
        en: "Reset?",
        zh: "重置？",
        fr: "Réinitialiser ?",
        ru: "Перезагрузка?"
    });
    if (confirm(translation)) {
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
        alert(t({
            de: `Seite ${pageID} wurde erfolgreich gedreht`,
            en: `Page ${pageID} was successfully rotated`,
            fr: `La page ${pageID} a été tournée avec succès`,
            ru: `Страница ${pageID} была успешно повернута`,
            zh: `页面${pageID}被成功旋转`
        }))
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

window.resizePage = function (pageID) {
    const modalElement = document.getElementById("resizeModal");
    const myModal = new Modal(modalElement);
    myModal.show();

    const resizeSetup = async (reset = false) => {
        const pageInformation = pagesObject[pageID];
        const pdfDocument = await PDFDocument.load(filesObject[pageInformation.pdfIndex]);
        const page = pdfDocument.getPage(pageInformation.pageIndex - 1);

        originalSizesObject[pageID] ||= page.getSize();

        let widthElement = document.querySelector("#resizeModal #width");
        let heightElement = document.querySelector("#resizeModal #height");
        if (page.getRotation().angle % 180 === 90) {
            [widthElement, heightElement] = [heightElement, widthElement];
        }
        let pageSize;
        if (!reset) {
            pageSize = page.getSize();
        } else {
            pageSize = originalSizesObject[pageID];
        }

        widthElement.value = pageSize.width.toFixed(2);
        heightElement.value = pageSize.height.toFixed(2);

        const select = document.querySelector("#resizeModal select");
        select.value = undefined;
        Object.entries(PageSizes).forEach(([size, measurement]) => {
            if (select.options.length <= Object.keys(PageSizes).length) {
                const option = document.createElement("option");
                option.value = size;
                option.innerText = `${size} (${measurement.join("pt x ")}pt)`;
                select.appendChild(option);
            }
            if (measurement[0] == pageSize.width.toFixed(2) && measurement[1] == pageSize.height.toFixed(2)) {
                select.value = size;
            }
        });

        const keepAspectRatio = document.querySelector("#keepAspectRatio");
        keepAspectRatio.checked = true;
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

        const selectChange = () => {
            if (!select.value) return;
            aspectRatio = widthElement.value / heightElement.value;
            widthElement.value = PageSizes[select.value][0];
            if (keepAspectRatio.checked) {
                heightElement.value = (widthElement.value / aspectRatio).toFixed(2);
            } else {
                heightElement.value = PageSizes[select.value][1];
            }
        };

        select.onmouseup = () => {
            selectChange();
        };
        select.onkeyup = () => {
            selectChange();
        };
        selectChange();

        const closeModalElement = document.querySelector("#resizeModalClose");
        closeModalElement.onclick = async () => {
            page.scale(
                parseFloat(widthElement.value) / page.getSize().width.toFixed(2),
                parseFloat(heightElement.value) / page.getSize().height.toFixed(2)
            );
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
        const resetModalElement = document.querySelector("#resizeModalReset");
        resetModalElement.onclick = () => {
            resizeSetup(true);
        };
    };
    resizeSetup();
};

window.savePDF = async function () {
    // ask user for new file name
    let downloadFileName = prompt("[" + t({
        de: "Dateiname",
        en: "filename",
        fr: "nom du fichier",
        ru: "имя файла",
        zh: "文件名"
    }) + "].pdf");

    if (downloadFileName === null || downloadFileName === "" || downloadFileName.trim().length < 1) {

        alert(t({
            de: "Dateiname nicht gültig!",
            en: "Filename not valid!",
            fr: "Nom de fichier non valide !",
            ru: "Имя файла недействительно!",
            zh: "文件名无效!"
        }));
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
