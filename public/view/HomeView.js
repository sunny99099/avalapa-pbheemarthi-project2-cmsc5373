import { AbstractView } from "./AbstractView.js";
import { currentUser } from "../controller/firebase_auth.js";

export class HomeView extends AbstractView {
    controller = null;
    initialItemQty = {}; // Track initial quantities to detect changes
    
    constructor(controller) {
        super();
        this.controller = controller;
    }
    
    async onMount() {
        if (!currentUser) {
            this.parentElement.innerHTML = '<h1> Access Denied </h1>';
            return;
        } else {
            await this.controller.loadItemsFromFirebase();
            await this.updateView();
            this.attachEvents();
            this.saveInitialQuantities();
        }
    }

    saveInitialQuantities() {
        // Store initial quantities of all items
        this.initialItemQty = {};
        for (const item of this.controller.model.itemList) {
            this.initialItemQty[item.docId] = item.qty;
        }
    }
    
    hasItemChanged(docId, currentQty) {
        return this.initialItemQty[docId] !== currentQty;
    }

    async updateView() {
        const viewWrapper = document.createElement('div');
        
        try {
            const response = await fetch('/view/templates/home.html', { cache: 'no-store' });
            if (response.ok) {
                viewWrapper.innerHTML = await response.text();
            } else {
                // If template can't be loaded, create a basic layout
                viewWrapper.innerHTML = `
                    <h2 class="mt-3 mb-3">My Inventory</h2>
                    <div class="d-flex justify-content-center p-4 bg-light mb-4">
                        <input type="text" class="form-control me-2" id="ItemName" placeholder="Item name" style="max-width: 400px;">
                        <button class="btn btn-outline-primary" id="addItem">Create</button>
                    </div>
                `;
            }
        } catch (error) {
            // If fetch fails, create a basic layout
            viewWrapper.innerHTML = `
                <h2 class="mt-3 mb-3">My Inventory</h2>
                <div class="d-flex justify-content-center p-4 bg-light mb-4">
                    <input type="text" class="form-control me-2" id="ItemName" placeholder="Item name" style="max-width: 400px;">
                    <button class="btn btn-outline-primary" id="addItem">Create</button>
                </div>
            `;
        }

        const list = this.renderItemList();
        viewWrapper.appendChild(list);
        
        // Replace the current content with the new content
        this.parentElement.innerHTML = '';
        this.parentElement.appendChild(viewWrapper);
        
        // Save initial quantities after view update
        this.saveInitialQuantities();
    }

    renderItemList() {
        const list = document.createElement('div');
        list.id = 'itemList';
        list.className = 'row row-cols-1 row-cols-md-3 g-4';
        
        if (this.controller.model.itemList.length === 0) {
            const noData = document.createElement('div');
            noData.className = 'col-12 text-center';
            noData.innerHTML = '<h3 class="text-muted">No Items Found</h3>';
            list.appendChild(noData);
        } else {
            for (const item of this.controller.model.itemList) {
                const card = this.createCard(item);
                list.appendChild(card);
            }
        }
        return list;
    }

    createCard(item) {
        const card = document.createElement('div');
        card.className = 'col';
        card.innerHTML = `
            <div id="${item.docId}" class="card shadow-sm h-100">
                <div class="card-header bg-primary text-white">
                    <h5 class="card-title mb-0">${item.name}</h5>
                </div>
                <div class="card-body">
                    <div class="row align-items-center mb-3">
                        <div class="col-4 text-center">
                            <button class="btn btn-outline-danger btn-sm minus">-</button>
                        </div>
                        <div class="col-4 text-center">
                            <p class="mb-0 pt-1 qty-display">${item.qty}</p>
                        </div>
                        <div class="col-4 text-center">
                            <button class="btn btn-outline-primary btn-sm plus">+</button>
                        </div>
                    </div>
                    <div class="row">
                        <div class="col-6">
                            <button class="btn btn-outline-primary btn-sm w-100 update">Update</button>
                        </div>
                        <div class="col-6">
                            <button class="btn btn-outline-secondary btn-sm w-100 cancel">Cancel</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        return card;
    }

    attachEvents() {
        const createItemBtn = document.getElementById('addItem');
        if (createItemBtn) {
            createItemBtn.onclick = this.controller.additemtofirebase;
        }
        
        // Add enter key handler for the item name input
        const itemNameInput = document.getElementById('ItemName');
        if (itemNameInput) {
            itemNameInput.onkeyup = (e) => {
                if (e.key === 'Enter') {
                    this.controller.additemtofirebase();
                }
            };
        }
        
        const qtyMinus = document.querySelectorAll('.minus');
        for (const button of qtyMinus) {
            button.onclick = (e) => {
                this.controller.decreaseQty(e);
                this.highlightChangedItem(e.target.closest('.card'));
            };
        }
        
        const qtyPlus = document.querySelectorAll('.plus');
        for (const button of qtyPlus) {
            button.onclick = (e) => {
                this.controller.increaseQty(e);
                this.highlightChangedItem(e.target.closest('.card'));
            };
        }
        
        const updateBtn = document.querySelectorAll('.update');
        for (const button of updateBtn) {
            button.onclick = this.controller.updateItem;
        }
        
        const cancelBtn = document.querySelectorAll('.cancel');
        for (const button of cancelBtn) {
            button.onclick = this.controller.cancelItem;
        }
    }
    
    highlightChangedItem(card) {
        const docId = card.id;
        const qtyDisplay = card.querySelector('.qty-display');
        const currentQty = parseInt(qtyDisplay.textContent);
        
        if (this.hasItemChanged(docId, currentQty)) {
            // Item has been changed, highlight card
            card.classList.add('border-warning');
            card.classList.add('border-2');
        } else {
            // Item reverted to original value, remove highlight
            card.classList.remove('border-warning');
            card.classList.remove('border-2');
        }
    }

    async onLeave() {
        if (!currentUser) {
            this.parentElement.innerHTML = '<h1> Access Denied </h1>';
            return;
        }
        console.log('HomeView.onLeave() is called');
    }
}