import * as pdfjsLib from 'pdfjs-dist/webpack';
import {PDFDocument} from "pdf-lib";
import {Sortable} from "@shopify/draggable";
import Dropzone from "dropzone";
import {handlePdf, handlePng, handleJpeg} from "./fileHandlers";
import { copyArrayBuffer } from './helperFunctions';

let pageCounter = 1;
let pagesObject = {};
let filesCounter = 1;
let filesObject = {};

const container = document.querySelector("#drag-area");

// make html elements draggable
const drag = new Sortable(container, {
    draggable: ".card-auto-size",
})

let myDropzone = new Dropzone(
    "#dropzone",
    {
        autoProcessQueue: false,
        url: "#",
        acceptedFiles: ".pdf,.jpg,.jpeg,.png",
        uploadMultiple: true,
        dictDefaultMessage: "Dateien zum Hochladen hier ablegen / Drop files here to upload"
    });

myDropzone.on("addedfiles", async files => {
    for (const file of files) {
        try {
            await processFile(file);
        } catch (e) {
            alert(e.message)
        }
    }
    myDropzone.removeAllFiles();
})

// is called for each uploaded file
async function processFile(file) {
    //myDropzone.element.classList.add("d-none");
    myDropzone.emit("uploadprogress", file, 0)
    switch (file.type) {
        case "application/pdf":
            filesObject[filesCounter] = (await handlePdf(file));
            break;
        case "image/jpeg":
            filesObject[filesCounter] = await handleJpeg(file);
            break;
        case "image/png":
            filesObject[filesCounter] = await handlePng(file);
            break;
        default:
            myDropzone.removeFile(file);
            alert("Keine PDF-Dateien / Invalid PDF file!")
            return;
    }

    const pdfFile = filesObject[filesCounter];
    const pdfDoc = await pdfjsLib.getDocument(copyArrayBuffer(pdfFile)).promise;
    const pageAmount = await pdfDoc.numPages;
    for (let pageIndex = 1; pageIndex <= pageAmount; pageIndex++) {
        myDropzone.emit("uploadprogress", file, Math.round(pageIndex / pageAmount * 100));

        const pdfPage = await pdfDoc.getPage(pageIndex);
        let pdfViewport = pdfPage.getViewport({scale: 1});
        let scale = 1;
        if (pdfViewport.height > pdfViewport.width) {
            scale = 200 / pdfViewport.height;
        } else {
            scale = 200 / pdfViewport.width;
        }
        pdfViewport = pdfPage.getViewport({scale});


        const canvas = document.createElement("canvas");
        const context = canvas.getContext('2d');
        canvas.height = pdfViewport.height;
        canvas.width = pdfViewport.width;
        canvas.classList.add("card-img-top");

        const card = template(pageCounter, ("name" in file) ? file.name : null);
        card.querySelector('.card-body').insertAdjacentElement("afterbegin", canvas);

        container.insertAdjacentElement("beforeend", card);

        pdfPage.render({
            canvasContext: context,
            viewport: pdfViewport
        });
        pagesObject[pageCounter] = {
            pageIndex: pageIndex,
            pdfIndex: filesCounter
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
}

window.resetPage = function () {
    if (confirm("Zurücksetzen/Reset?")) {
        location.reload()
    }
}

const template = (page, fileName = null) => {
    const container = document.createElement("span");
    container.innerHTML = `
        <div class="card card-auto-size" data-page-id="${page}">
            <div class="card-header bg-warning p-1 text-center"><b>${page}</b></div>
            ${fileName !== null ? `<div class="card-header bg-warning p-1 text-center">(${fileName})</div>` : ""}
            <div class="card-body p-0"></div>
            <div class="card-footer bg-danger p-0">
                <button class="btn btn-danger w-100 m-0 p-3" onclick="removePage(${page})"><i class="gg-trash mx-auto"></i></button>
            </div>
        </div>
        `;
    return container.firstElementChild;
}

window.savePDF = async function () {
    // ask user for new file name
    let downloadFileName = prompt("[Dateiname/Filename].pdf");
    if (downloadFileName === null || downloadFileName === "" || downloadFileName.trim().length < 1) {
        alert("Dateiname nicht gültig! / Filename not valid!")
        return;
    }

    // merge pdfs
    const pdfDocumentCache = {};
    const finalPDF = await PDFDocument.create();
    const pagesElements = document.querySelector("#drag-area").querySelectorAll("div[data-page-id]");
    for (const pageElement of pagesElements) {
        const pageId = pageElement.dataset.pageId
        const page = pagesObject[pageId]
        if (!pdfDocumentCache.hasOwnProperty(page.pdfIndex)) {
            pdfDocumentCache[page.pdfIndex] = await PDFDocument.load(filesObject[page.pdfIndex]);
        }
        finalPDF.addPage((await finalPDF.copyPages(
            pdfDocumentCache[page.pdfIndex],
            [page.pageIndex - 1]
        ))[0])
    }

    // generate and download blob
    const pdf = new Blob([await finalPDF.save()], {
        type: "application/pdf"
    })

    let link = document.createElement("a");
    link.download = downloadFileName + ".pdf";
    const objectUrl = URL.createObjectURL(pdf);
    link.href = objectUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(objectUrl)
}
