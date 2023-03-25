"use strict";

import { t } from "./helperFunctions";

document.getElementById("saveButton").innerText = t({
    de: "Speichern",
    en: "Save",
    ru: "Сохранить",
    fr: "Enregistrer",
    zh: "拯救",
});
document.getElementById("resizeModalClose").innerText = document.getElementById("saveButton").innerText;

document.getElementById("previewButton").innerText = t({
    de: "Vorschau",
    en: "Preview",
    ru: "Предварительный просмотр",
    fr: "Aper",
    zh: "预览",
});
document.getElementById("staticBackdropLabel").innerText = document.getElementById("previewButton").innerText;

document.getElementById("resetButton").innerText = t({
    de: "Zurücksetzen",
    en: "Reset",
    ru: "Сброс",
    fr: "Réinitialiser",
    zh: "复位",
});
document.getElementById("resizeModalReset").innerText = document.getElementById("resetButton").innerText;

document.getElementById("scrollUpButton").innerText = t({
    de: "Hochscrollen",
    en: "Scroll up",
    ru: "Прокрутите вверх",
    fr: "Défilement vers le haut",
    zh: "向上滚动",
});

document.getElementById("closeText").innerText = t({
    de: "Schließen",
    en: "Close",
    ru: "Закрыть",
    fr: "Fermer",
    zh: "关闭",
});

document.getElementById("staticBackdropLabel2").innerText = t({
    de: "Größe anpassen",
    en: "Adjust size",
    ru: "Изменить размер",
    fr: "Ajuster la taille",
    zh: "调整大小",
});

document.getElementById("presetLabel").innerText = t({
    de: "Voreinstellung",
    en: "Preset",
    ru: "Предустановка",
    fr: "Préréglage",
    zh: "预设",
});

document.getElementById("widthLabel").innerText = t({
    de: "Breite",
    en: "Width",
    ru: "Широкий",
    fr: "Largeur",
    zh: "宽幅",
});

document.getElementById("heightLabel").innerText = t({
    de: "Höhe",
    en: "Height",
    ru: "Высота",
    fr: "Hauteur",
    zh: "高度",
});
