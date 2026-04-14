// Entidade do item presente em um estoque

import { ValidationError } from "../errors/validation.error";
import { Product } from "./product.entity";
import { Stock } from "./stock.entity";

type ProductStockProps = Readonly<{
    id: string,
    stockId: string,
    productId: string,
    quantity: number,

    product?: Product;
    stock?: Stock;

    createdAt: Date,
    updatedAt: Date,
    deletedAt?: Date,
}>

export class ProductStock {
    private readonly _id: string;
    private _stockId: string;
    private _productId: string;
    private _quantity: number;

    private _product?: Product;
    private _stock?: Stock;

    private _createdAt: Date;
    private _updatedAt: Date;
    private _deletedAt?: Date;

    private constructor(props: ProductStockProps) {
        if (!props.id?.trim()) throw new ValidationError("Id cannot be empty");
        this.validateProductId(props.productId);
        this.validateStockId(props.stockId);
        this.validateQuantity(props.quantity);

        this._id = props.id;
        this._productId = props.productId;
        this._stockId = props.stockId;
        this._quantity = props.quantity;

        this._product = props.product;
        this._stock = props.stock;

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

    // talvez nunca seja usado
    changeStockId(id: string): void {
        this.ensureNotDeleted();
        // verifica se a prop é igual ao id atual
        if (id === this._stockId) return;
        this.validateStockId(id);

        this._stockId = id;
        this.touch();
    }

    get productId(): string {
        return this._productId;
    }

    // talvez nunca seja usado
    changeProductId(id: string): void {
        this.ensureNotDeleted();
        // verifica se a prop é igual ao id atual
        if (id === this._productId) return;
        this.validateProductId(id);

        this._productId = id;
        this.touch();
    }

    get quantity(): number {
        return this._quantity;
    };

    changeQuantity(quantity: number): void {
        this.ensureNotDeleted();
        this.validateQuantity(quantity);

        this._quantity = quantity;
        this.touch();
    }

    increase(amount: number): void {
        this.ensureNotDeleted();
        this.validateAmount(amount);

        this._quantity += amount;
        this.touch();
    }

    decrease(amount: number): void {
        this.ensureNotDeleted();
        this.validateAmount(amount);
        if (amount > this._quantity) throw new ValidationError("Insufficient stock");

        this._quantity -= amount;
        this.touch();
    }

    get product(): Product | undefined {
        return this._product;
    }

    get stock(): Stock | undefined {
        return this._stock;
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

    delete(): void {
        this.ensureNotDeleted();

        this._deletedAt = new Date();
        this.touch();
    }

    restoreDeleted(): void {
        if (!this._deletedAt) return;

        this._deletedAt = undefined;
        this.touch();
    }

    isActive(): boolean {
        return !this._deletedAt;
    }

    toJSON() {
        return {
            id: this._id,
            stockId: this._stockId,
            productId: this._productId,
            quantity: this._quantity,
            product: this._product ? this._product.toJSON() : undefined,
            stock: this._stock ? this._stock.toJSON() : undefined,
            createdAt: this._createdAt,
            updatedAt: this._updatedAt,
            deletedAt: this._deletedAt,
        };
    }

    // testa apenas a quantidade 
    private validateQuantity(quantity: number): void {
        if (!Number.isSafeInteger(quantity) || quantity < 0) throw new ValidationError("Invalid quantity");
    }

    private validateProductId(productId: string): void {
        if (!productId?.trim()) throw new ValidationError("Product id cannot be empty");
    }

    private validateStockId(stockId: string): void {
        if (!stockId?.trim()) throw new ValidationError("Stock id cannot be empty");
    }

    private validateAmount(amount: number): void {
        if (!Number.isSafeInteger(amount) || amount <= 0) throw new ValidationError("Amount must be greater than zero");
    }

    private ensureNotDeleted(): void {
        if (!this.isActive) throw new ValidationError("Product stock is deleted");
    }

    private touch(): void {
        this._updatedAt = new Date();
    }
}