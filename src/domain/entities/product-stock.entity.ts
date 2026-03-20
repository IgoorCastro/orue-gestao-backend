// Entidade do item presente em um estoque

type ProductStockProps = Readonly<{
    id: string,
    stockId: string,
    productId: string,
    quantity: number,
    createdAt: Date,
    updatedAt: Date,
    deletedAt?: Date,
}>

export class ProductStock {
    private readonly _id: string;
    private _stockId: string;
    private _productId: string;
    private _quantity: number;
    private _createdAt: Date;
    private _updatedAt: Date;
    private _deletedAt?: Date;

    private constructor(props: ProductStockProps) {
        if (!props.id || props.id.trim().length === 0) throw new Error("Id cannot be empty");
        this.validateProductId(props.productId);
        this.validateStockId(props.stockId);
        this.validateQuantity(props.quantity);

        this._id = props.id;
        this._productId = props.productId;
        this._stockId = props.stockId;
        this._quantity = props.quantity;
        this._createdAt = props.createdAt;
        this._updatedAt = props.updatedAt;
        this._deletedAt = props.deletedAt;
    }

    // util para criar novos registros
    static create(props: { id: string, stockId: string, productId: string, quantity: number }): ProductStock {
        const now = new Date();

        return new ProductStock({
            id: props.id,
            stockId: props.stockId,
            productId: props.productId,
            quantity: props.quantity,
            createdAt: now,
            updatedAt: now,
            deletedAt: undefined,
        });
    }

    static restore(props: ProductStockProps): ProductStock {
        return new ProductStock(props);
    }

    get id(): string {
        return this._id;
    }

    get stockId(): string {
        return this._stockId;
    }

    changeStockId(id: string): void {
        // verifica se a prop é igual ao id atual
        if (id === this._stockId) return;
        this.validateStockId(id);

        this._stockId = id;
        this.touch();
    }

    get productId(): string {
        return this._productId;
    }

    changeProductId(id: string): void {
        // verifica se a prop é igual ao id atual
        if (id === this._productId) return;
        this.validateProductId(id);

        this._productId = id;
        this.touch();
    }

    get quantity(): number {
        return this._quantity;
    };

    increase(amount: number): void {
        this.validateAmount(amount);

        this._quantity += amount;
        this.touch();
    }

    decrease(amount: number): void {
        this.validateAmount(amount);
        if(this._quantity - amount < 0) throw new Error("Insufficient stock");

        this._quantity -= amount;
        this.touch();
    }

    get createdAt(): Date {
        return this._createdAt;
    }

    get updatedAt(): Date {
        return this._updatedAt;
    }

    get deletedAt(): Date | undefined {
        return this._deletedAt;
    }

    // testa apenas a quantidade 
    private validateQuantity(quantity: number): void {
        if (!Number.isSafeInteger(quantity) || quantity < 0) throw new Error("Invalid quantity");
    }

    private validateProductId(productId: string): void {
        if (!productId || productId.trim().length === 0) throw new Error("Product id cannot be empty");
    }

    private validateStockId(stockId: string): void {
        if (!stockId || stockId.trim().length === 0) throw new Error("Stock id cannot be empty");
    }

    private validateAmount(amount: number): void {
        if (!Number.isSafeInteger(amount) || amount <= 0) throw new Error("Amount must be greater than zero");
    }

    private touch(): void {
        this._updatedAt = new Date();
    }
}