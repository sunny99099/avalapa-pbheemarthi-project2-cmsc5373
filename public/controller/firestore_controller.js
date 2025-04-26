import {
    getFirestore,
    collection,
    addDoc,
    query,
    orderBy,
    getDocs,
    where,
    doc,
    deleteDoc,
    updateDoc,
} from "https://www.gstatic.com/firebasejs/11.2.0/firebase-firestore.js"
import { item } from '../model/itemModel.js';
import { app } from './firebase_core.js';
import { currentUser } from './firebase_auth.js';

const db = getFirestore(app);
const itemCollection = "inventory";

export async function addItem(item) {
    const colRef = collection(db, itemCollection);
    const docRef = await addDoc(colRef, item.toFirestore());
    return docRef.id;
}

export async function getItemsList() {
    let itemList = [];
    if (!currentUser) return itemList;
    
    try {
        const q = query(
            collection(db, itemCollection), 
            where('email', '==', currentUser.email), 
            orderBy("name", "asc")
        );
        const snapshot = await getDocs(q);
        snapshot.forEach(doc => {
            const i = new item(doc.data());
            i.set_docId(doc.id);
            itemList.push(i);
        });
    } catch (error) {
        console.error("Error getting items list:", error);
    }
    
    return itemList;
}

export async function updateItem(item) {
    try {
        const docRef = doc(db, itemCollection, item.docId);
        await updateDoc(docRef, item.toFirestore());
        return true;
    } catch (error) {
        console.error("Error updating item:", error);
        throw error;
    }
}

export async function deleteItem(docId) {
    try {
        const docRef = doc(db, itemCollection, docId);
        await deleteDoc(docRef);
        return true;
    } catch (error) {
        console.error("Error deleting item:", error);
        throw error;
    }
}