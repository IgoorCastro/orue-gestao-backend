// Entidade do item presente em um estoque
export class ItemStock {
    constructor(
        public readonly id: string,
        public readonly stockId: string,
        public readonly productId: string,
        private quantity: number,
    ) {
        if (!Number.isSafeInteger(quantity) || quantity < 0) throw new Error("Invalid quantity");
    }

    validateQuantity(amount: number): void {
        if(!Number.isSafeInteger(amount) || amount < 1) throw new Error("Invalid amount");
    }

    getQuantity(): number {
        return this.quantity;
    };

    increase(amount: number): void {
        this.validateQuantity(amount);
        this.quantity += amount;
    }

    decrease(amount: number): void {     
        this.validateQuantity(amount);
        if(this.quantity < 1) throw new Error("Insufficient stock")
        this.quantity -= amount;
    }
}