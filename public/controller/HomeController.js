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
        let name = itemNameInput.value.trim();
        
        // Get the button and disable it
        const addButton = document.getElementById('addItem');
        if (addButton) {
            addButton.disabled = true;
            addButton.innerHTML = 'Adding...';
        }
    
        // Convert name to lowercase
        name = name.toLowerCase();
        
        if (!name) {
            alert("Please enter an item name");
            if (addButton) {
                addButton.disabled = false;
                addButton.innerHTML = 'Create';
            }
            return;
        }

        if(name.length < 2) {
            alert("Item name should be at least 2 characters");
            if (addButton) {
                addButton.disabled = false;
                addButton.innerHTML = 'Create';
            }
            return;
        }
    
        // Check for duplicates in the current item list
        const isDuplicate = this.model.itemList.some(item => 
            item.name.toLowerCase() === name
        );
    
        if (isDuplicate) {
            alert("This item already exists in your inventory");
            if (addButton) {
                addButton.disabled = false;
                addButton.innerHTML = 'Create';
            }
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
        finally {
            // Set a timeout to re-enable the button after 2 seconds
            setTimeout(() => {
                const addButton = document.getElementById('addItem');
                if (addButton) {
                    addButton.disabled = false;
                    addButton.innerHTML = 'Create';
                }
            }, 2000);
        }
    }

    // Only update the local display, not Firebase
    decreaseQty(event) {
        const card = event.target.closest('.card');
        const docId = card.id;
        const item = this.model.getItemById(docId);
        
        if (item && item.qty > 0) {
            item.qty -= 1;
            
            // Update only the display, not Firestore
            const qtyDisplay = card.querySelector('p');
            if (qtyDisplay) {
                qtyDisplay.textContent = item.qty;
                
                // Optionally highlight in red if quantity reaches zero
                if (item.qty === 0) {
                    qtyDisplay.style.color = 'red';
                }
            }
        } else if (item && item.qty === 0) {
            // Show message when trying to decrease below zero
            alert("Cannot reduce item count below zero");
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
                // Show confirmation before deletion when Update is pressed
                const confirmDelete = confirm(`Are you sure you want to delete "${item.name}" permanently?`);
                if (confirmDelete) {
                    // Delete item if confirmed
                    await this.deleteItemFromFirebase(docId);
                } else {
                    // If deletion is canceled, set quantity back to 1
                    item.qty = 1;
                    const qtyDisplay = card.querySelector('p');
                    if (qtyDisplay) {
                        qtyDisplay.textContent = item.qty;
                        qtyDisplay.style.color = ''; // Reset color
                    }
                    await this.updateItemInFirebase(item);
                }
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
        const item = this.model.getItemById(docId);
        
        if (item) {
            // Reset the item to its original value from Firebase
            try {
                // Get the original item from Firebase
                const originalItems = await getItemsList();
                const originalItem = originalItems.find(i => i.docId === docId);
                
                if (originalItem) {
                    // Update the local model with the original quantity
                    item.qty = originalItem.qty;
                    
                    // Update the display
                    const qtyDisplay = card.querySelector('p');
                    if (qtyDisplay) {
                        qtyDisplay.textContent = item.qty;
                        qtyDisplay.style.color = ''; // Reset color
                    }
                    
                    // Remove any highlighting
                    card.classList.remove('border-warning');
                    card.classList.remove('border-2');
                }
            } catch (e) {
                console.error('Error fetching original item data', e);
                alert("Error cancelling changes: " + e.message);
            }
        }
    }

    async updateItemInFirebase(item) {
        try {
            await updateItem(item);
            
            // Find the specific card in the DOM
            const card = document.getElementById(item.docId);
            if (card) {
                // Update just this specific card's appearance
                
                // Reset any highlights
                card.classList.remove('border-warning');
                card.classList.remove('border-2');
                
                // Update the quantity display
                const qtyDisplay = card.querySelector('p');
                if (qtyDisplay) {
                    qtyDisplay.textContent = item.qty;
                    qtyDisplay.style.color = ''; // Reset color if it was changed
                }
                
                // Optionally show a brief success indicator
                card.classList.add('border-success');
                card.classList.add('border-2');
                
                // Remove success indicator after a short delay
                setTimeout(() => {
                    card.classList.remove('border-success');
                    card.classList.remove('border-2');
                }, 1000);
            }
            
            // Update the initialQty in the view to track future changes
            if (this.view && this.view.initialItemQty) {
                this.view.initialItemQty[item.docId] = item.qty;
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