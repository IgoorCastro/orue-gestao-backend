// entidade da loja
export class Store {
    constructor(
        public readonly id: string,
        public name: string,
    ) {
        if(!name || name.trim().length === 0) throw new Error("Name cannot be empty")
     }
}