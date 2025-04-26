import { AbstractView } from './AbstractView.js';
import { currentUser } from '../controller/firebase_auth.js';

export class ProfileView extends AbstractView {
    controiller = null;
    constructor(controller) {
        super();
        this.controller = controller;
    }
    async onMount() {
        if (!currentUser) {
            this.parentElement.innerHTML = '<h1> Access Denied </h1>';
            return;
        }
        console.log('ProfileView.onMount() is called');
    }
    async updateView() {
        console.log('ProfileView.updateView() is called');
        const viewWrapper = document.createElement('div');
        viewWrapper.innerHTML = `
            <h1>Profile</h1>
            <p>Welcom to your profile page.</p>
            <p>Email: ${currentUser.email}</p>
            <p>user UID: ${currentUser.uid}</p>
        `;

        return viewWrapper;
    }
    attachEvents() {
        console.log('ProfileView.attachEvents() is called');
    }
    async onLeave() {
        if (!currentUser) {
            this.parentElement.innerHTML = '<h1> Access Denied </h1>';
            return
        }
        console.log('ProfileView.onLeave() is called');
    }
}
