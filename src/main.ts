declare const $: any;
import { ListManager } from "./ListManager.js";

$(document).ready(() => {
    try {
        new ListManager("#app");
    } catch (error) {
        console.error("Error initializing ListManager:", error);
        alert("Failed to initialize the list manager. Check console for details.");
    }
});
