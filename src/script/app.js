import * as pdfjsLib from 'pdfjs-dist/webpack';
import {Sortable} from "@shopify/draggable";
import Dropzone from "dropzone";

let pageCounter = 1;

// make html elements draggable
const container = document.querySelector("#drag-area");
const drag = new Sortable(container, {
    draggable: ".card-auto-size",
})

let myDropzone = new Dropzone("#dropzone", { autoProcessQueue: false, url: "#", acceptedFiles: ".pdf" });
myDropzone.on("addedfile", async file => {
    //myDropzone.element.classList.add("d-none");
    const pdfFile = file
    const pdfDoc = await pdfjsLib.getDocument(await pdfFile.arrayBuffer()).promise
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
    
        pdfPage.render({canvasContext: context, viewport: pdfViewport});
        pageCounter++;
    }
    myDropzone.removeAllFiles()
});

window.removePage = function (pageID)
{
    const page = document.querySelector('div[data-page-id="'+pageID+'"]');
    console.log(page)
    if (page && confirm(`Seite ${pageID} entfernen? | Remove page ${pageID}?`) === true) {
        page.remove()
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

window.savePDF = function ()
{
    const pages = document.querySelector("#drag-area").querySelectorAll("div[data-page-id]");
    const idList = [];
    for (const page of pages) {
        idList.push(page.dataset.pageId)
    }
    // TODO: create list from page ids
}
