import { HomeModel } from '../model/HomeModel.js';
import { item } from '../model/itemModel.js';
import { currentUser } from './firebase_auth.js';
import { addItem, getItemsList, updateItem, deleteItem } from './firestore_controller.js';

export const glHomeModel = new HomeModel();

export class HomeController {
    model = null;
    view = null;
    
    constructor() {
        this.model = new HomeModel();
        this.additemtofirebase = this.additemtofirebase.bind(this);
        this.decreaseQty = this.decreaseQty.bind(this);
        this.increaseQty = this.increaseQty.bind(this);
        this.updateItem = this.updateItem.bind(this);
        this.cancelItem = this.cancelItem.bind(this);
    }
    
    setView(view) {
        this.view = view;
    }

    async additemtofirebase() {
        const itemNameInput = document.getElementById('ItemName');
        const name = itemNameInput.value.trim();
        
        if (!name) {
            alert("Please enter an item name");
            return;
        }
        
        const email = currentUser.email;
        const qty = 1;
        const timestamp = new Date().getTime();
        const newItem = new item({ name, email, qty, timestamp });
        
        try {
            const docid = await addItem(newItem);
            newItem.set_docId(docid);
            this.model.itemList.push(newItem);
            
            // Sort alphabetically by name
            this.model.itemList.sort((a, b) => a.name.localeCompare(b.name));
            
            // Clear the input field after adding
            itemNameInput.value = '';
            
            // Update the view to show the new item
            if (this.view) {
                await this.view.updateView();
                this.view.attachEvents();
            }
        }
        catch (e) {
            console.log('Error in adding item to firebase', e);
            alert("Error adding item: " + e.message);
        }
    }

    // Only update the local display, not Firebase
    decreaseQty(event) {
        const card = event.target.closest('.card');
        const docId = card.id;
        const item = this.model.getItemById(docId);
        
        if (item && item.qty > 1) {
            item.qty -= 1;
            
            // Update only the display, not Firestore
            const qtyDisplay = card.querySelector('p');
            if (qtyDisplay) {
                qtyDisplay.textContent = item.qty;
            }
        } else if (item && item.qty <= 1) {
            // Show confirmation before marking for deletion
            const confirmDelete = confirm(`Are you sure you want to delete "${item.name}" permanently?`);
            if (confirmDelete) {
                item.qty = 0; // Mark for deletion
                
                // Update only the display, not Firestore
                const qtyDisplay = card.querySelector('p');
                if (qtyDisplay) {
                    qtyDisplay.textContent = '0';
                    qtyDisplay.style.color = 'red';
                }
            }
        }
    }

    // Only update the local display, not Firebase
    increaseQty(event) {
        const card = event.target.closest('.card');
        const docId = card.id;
        const item = this.model.getItemById(docId);
        
        if (item) {
            item.qty += 1;
            
            // Update only the display, not Firestore
            const qtyDisplay = card.querySelector('p');
            if (qtyDisplay) {
                qtyDisplay.textContent = item.qty;
                qtyDisplay.style.color = ''; // Reset color if it was marked for deletion
            }
        }
    }

    // Update Firebase when the update button is clicked
    async updateItem(event) {
        const card = event.target.closest('.card');
        const docId = card.id;
        const item = this.model.getItemById(docId);
        
        if (item) {
            if (item.qty <= 0) {
                // Delete item if quantity is 0
                await this.deleteItemFromFirebase(docId);
            } else {
                // Update item in Firebase
                await this.updateItemInFirebase(item);
            }
        }
    }

    // Revert to stored value when cancel is clicked
    async cancelItem(event) {
        const card = event.target.closest('.card');
        const docId = card.id;
        
        // Refresh all items from Firebase to get the original values
        await this.loadItemsFromFirebase();
    }

    async updateItemInFirebase(item) {
        try {
            await updateItem(item);
            // Refresh the view
            if (this.view) {
                await this.view.updateView();
                this.view.attachEvents();
            }
        } catch (e) {
            console.error('Error updating item in Firebase', e);
            alert("Error updating item: " + e.message);
        }
    }

    async deleteItemFromFirebase(docId) {
        try {
            await deleteItem(docId);
            // Remove from local model
            this.model.deleteItem(docId);
            // Refresh the view
            if (this.view) {
                await this.view.updateView();
                this.view.attachEvents();
            }
        } catch (e) {
            console.error('Error deleting item from Firebase', e);
            alert("Error deleting item: " + e.message);
        }
    }

    async loadItemsFromFirebase() {
        try {
            const items = await getItemsList();
            // Sort alphabetically by name
            items.sort((a, b) => a.name.localeCompare(b.name));
            this.model.itemList = items;
            
            if (this.view) {
                await this.view.updateView();
                this.view.attachEvents();
            }
        } catch (e) {
            console.log("Error loading items from Firebase", e);
            alert("Error loading items: " + e.message);
        }
    }
}