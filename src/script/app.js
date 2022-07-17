import * as pdfjsLib from 'pdfjs-dist/webpack';
import {PDFDocument} from "pdf-lib";
import {Sortable} from "@shopify/draggable";
import Dropzone from "dropzone";

let pageCounter = 1;
let pagesObject = {};
let filesCounter = 1;
let filesObject = {};

// make html elements draggable
const container = document.querySelector("#drag-area");
const drag = new Sortable(container, {
    draggable: ".card-auto-size",
})

let myDropzone = new Dropzone(
    "#dropzone",
    {
        autoProcessQueue: false,
        url: "#",
        acceptedFiles: ".pdf",
        uploadMultiple: true,
    });

myDropzone.on("addedfiles", async files => {
    for (const file of files) {
        await processFile(file);
    }
})

async function processFile(file){
    //myDropzone.element.classList.add("d-none");
    if (file.type !== "application/pdf") {
        myDropzone.removeFile(file);
        alert("Keine PDF-Datein / Invalid PDF file!")
        return;
    }
    filesObject[filesCounter] = await file.arrayBuffer();

    const pdfFile = filesObject[filesCounter];
    const pdfDoc = await pdfjsLib.getDocument(pdfFile).promise
    for (let pageIndex = 1; pageIndex <= await pdfDoc.numPages; pageIndex++){
        const pdfPage = await pdfDoc.getPage(pageIndex);
        let pdfViewport = pdfPage.getViewport({scale: 1});
        let scale = 1;
        if (pdfViewport.height > pdfViewport.width){
            scale = 200/pdfViewport.height
        } else {
            scale = 200/pdfViewport.width
        }
        pdfViewport = pdfPage.getViewport({scale});
    
    
        const canvas = document.createElement("canvas");
        var context = canvas.getContext('2d');
        canvas.height = pdfViewport.height;
        canvas.width = pdfViewport.width;
        canvas.classList.add("card-img-top");
        
        const card = template(pageCounter);
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
    myDropzone.removeAllFiles()
}

window.removePage = function (pageID)
{
    const page = document.querySelector('div[data-page-id="'+pageID+'"]');
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



const template = page => {
    const container = document.createElement("span");
    container.innerHTML = `
        <div class="card card-auto-size" data-page-id="${page}">
            <div class="card-header bg-warning p-1 text-center">${page}</div>
            <div class="card-body p-0"></div>
            <div class="card-footer bg-danger p-0">
                <button class="btn btn-danger w-100 m-0 p-3" onclick="removePage(${page})"><i class="gg-trash mx-auto"></i></button>
            </div>
        </div>`;
    return container.firstElementChild;
}

window.savePDF = async function ()
{
    const pdfDocumentCache = {};
    const finalPDF = await PDFDocument.create();
    const pagesElements = document.querySelector("#drag-area").querySelectorAll("div[data-page-id]");
    for (const pageElement of pagesElements) {
        const pageId = pageElement.dataset.pageId
        const page = pagesObject[pageId]
        if(!pdfDocumentCache.hasOwnProperty(page.pdfIndex)) {
            pdfDocumentCache[page.pdfIndex] = await PDFDocument.load(filesObject[page.pdfIndex]);
        }
        finalPDF.addPage((await finalPDF.copyPages(
            pdfDocumentCache[page.pdfIndex],
            [page.pageIndex - 1]
        ))[0])
    }

    const pdf = new Blob([await finalPDF.save()], {
        type: "application/pdf"
    })

    let link = document.createElement("a");
    link.download = prompt("[Dateiname/Filename].pdf") + ".pdf";
    link.href = URL.createObjectURL(pdf);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}
