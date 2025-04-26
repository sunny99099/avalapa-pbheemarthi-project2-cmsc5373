export class HomeModel {
        itemList;
        constructor() {
            this.itemList = [];
        }
        getItemById(docId){
            return this.itemList.find(item => item.docId === docId);
        }
        deleteItem(docId) {
            const index = this.itemList.findIndex(item => item.docId === docId);
            if (index !== -1) {
                this.itemList.splice(index, 1);
            }
        }
        updateItem(item, update){
            item.qty = update.qty;
        }
        sortItems() {
            this.itemList.sort((a, b) => a.name.localeCompare(b.name));
        }
}