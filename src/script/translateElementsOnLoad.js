"use strict";

import {t} from "./helperFunctions";

document.getElementById("saveButton").innerText = t({
    de: "Speichern",
    en: "Save",
    ru: "Сохранить",
    fr: "Enregistrer",
    zh: "拯救"
});

document.getElementById("previewButton").innerText = t({
    de: "Vorschau",
    en: "Preview",
    ru: "Предварительный просмотр",
    fr: "Aper",
    zh: "预览"
});

document.getElementById("staticBackdropLabel").innerText = t({
    de: "Vorschau",
    en: "Preview",
    ru: "Предварительный просмотр",
    fr: "Aper",
    zh: "预览"
});

document.getElementById("resetButton").innerText = t({
    de: "Zurücksetzen",
    en: "Reset",
    ru: "Сброс",
    fr: "Réinitialiser",
    zh: "复位"
});

document.getElementById("scrollUpButton").innerText = t({
    de: "Hochscrollen",
    en: "Scroll up",
    ru: "Прокрутите вверх",
    fr: "Défilement vers le haut",
    zh: "向上滚动"
});

document.getElementById("closeText").innerText = t({
    de: "Schließen",
    en: "Close",
    ru: "Закрыть",
    fr: "Fermer",
    zh: "关闭"
});
