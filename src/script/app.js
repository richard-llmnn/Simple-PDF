import * as pdfjsLib from 'pdfjs-dist/webpack';
import {Sortable} from "@shopify/draggable";
import Dropzone from "dropzone";

// make html elements draggable
const container = document.querySelector("#drag-area");
const drag = new Sortable(container, {
    draggable: ".card-auto-size",
})

let myDropzone = new Dropzone("#dropzone", { autoProcessQueue: false, url: "#" });
console.log(myDropzone)
myDropzone.on("addedfile", async file => {
    myDropzone.element.classList.add("d-none");
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
        
        const card = template(pageIndex);
        card.insertAdjacentElement("afterbegin", canvas);

        container.insertAdjacentElement("beforeend", card);
    
        pdfPage.render({canvasContext: context, viewport: pdfViewport});
    }
    myDropzone.removeAllFiles()
});

const template = page => {
    const container = document.createElement("span");
    container.innerHTML = `
        <div class="card card-auto-size">
            <div class="card-body">
                <div class="card-title bg-warning rounded-2" style="padding:4px;position:absolute;top:10px;left:10px">${page}</div>
                <button class="btn btn-danger"><i class="gg-trash"></i></button>
            </div>
        </div>`;
    return container.firstElementChild;
}
