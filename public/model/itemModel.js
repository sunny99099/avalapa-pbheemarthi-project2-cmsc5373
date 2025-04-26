export class item {
    name; email; qty = 1; timestamp;
    constructor(data){
        this.name = data.name;
        this.email = data.email;
        this.qty = data.qty;
        this.timestamp = data.timestamp;
    }

    set_docId(docId) {
        this.docId = docId;
    }

    toFirestore(){
        return {
            email: this.email,
            name: this.name,
            qty: this.qty,
            timestamp: this.timestamp
        }
    }
}
