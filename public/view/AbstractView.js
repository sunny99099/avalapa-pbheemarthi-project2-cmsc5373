import { currentUser } from "../controller/firebase_auth.js";

// common super class
export class AbstractView {
    parentElement = document.getElementById("spaRoot");

    constructor() {
        if (new.target === AbstractView) {
            throw new Error('Cannot instantiate AbstractView directly');
        }
    }

    //call when the view is mounted to the DOM
    async onMount() {
        throw new Error('onMount method must be implemented');
    }

    async render() {
        if(!currentUser){
            this.parentElement.innerHTML = '<h1> Access Denied </h1>';
            return;
        }
        
        await this.updateView();
        this.attachEvents();
    }

    async updateView() {
        throw new Error('updateView method must be implemented');
    }

    attachEvents() {
        throw new Error('attachEvents method must be implemented');
    }

    async onLeave() {
        throw new Error('onLeave method must be implemented');
    }
}