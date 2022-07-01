import * as pdfjsLib from 'pdfjs-dist/webpack';
import {Sortable} from "@shopify/draggable";
import Dropzone from "dropzone";

// make html elements draggable
const container = document.querySelector("#drag-area");
const drag = new Sortable(container, {
    draggable: ".card-auto-size",
})

let myDropzone = new Dropzone("#drag-area", { autoProcessQueue: false, url: "#" });
myDropzone.on("addedfile", file => {
    alert(`File added: ${file.name}`);
    myDropzone.removeAllFiles()
});



const input = document.createElement("input");
input.type = "file";
document.body.insertAdjacentElement("beforeend", input);
input.addEventListener("change", async e => {
    const pdfFile = e.currentTarget.files[0]
    const pdfDoc = await pdfjsLib.getDocument(await pdfFile.arrayBuffer()).promise
    const pdfPage = await pdfDoc.getPage(5);
    const pdfViewport = pdfPage.getViewport({scale: 1});

    console.log(pdfViewport);


    const canvas = document.createElement("canvas");
    var context = canvas.getContext('2d');
    canvas.height = pdfViewport.height;
    canvas.width = pdfViewport.width;

    document.body.insertAdjacentElement("beforeend", canvas);

    pdfPage.render({canvasContext: context, viewport: pdfViewport});
});
