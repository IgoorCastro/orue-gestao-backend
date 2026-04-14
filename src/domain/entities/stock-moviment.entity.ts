// entidade da movimentação de estoque

import { StockMovimentType } from "../enums/stock-moviment-type.enum"
import { ValidationError } from "../errors/validation.error";
import { ProductStock } from "./product-stock.entity";
import { Stock } from "./stock.entity";
import { User } from "./user.entity";

type StockMovimentProps = Readonly<{
    id: string,
    type: StockMovimentType,
    unitPrice: number,
    totalPrice: number,
    quantity: number,

    fromStockId?: string,
    toStockId?: string,
    productStockId: string,
    userId: string,

    fromStock?: Stock;
    toStock?: Stock;
    productStock?: ProductStock;
    user?: User;

    createdAt: Date,
    updatedAt: Date,
    deletedAt?: Date,
}>

export class StockMoviment {
    private readonly _id: string;
    private _type: StockMovimentType;
    private _unitPrice: number;
    private _totalPrice: number;
    private _quantity: number;

    private _fromStockId?: string;
    private _toStockId?: string;
    private _productStockId: string;
    private _userId: string;

    private _fromStock?: Stock;
    private _toStock?: Stock;
    private _productStock?: ProductStock;
    private _user?: User;


    private _createdAt: Date;
    private _updatedAt: Date;
    private _deletedAt?: Date;

    private constructor(props: StockMovimentProps) {
        if (!props.id?.trim()) throw new ValidationError("Id cannot be empty");
        if (!Object.keys(StockMovimentType).includes(props.type)) throw new ValidationError("Stock moviment type is invalid");        // valor deve ser maior que 0!
        this.validatePrice(props.unitPrice, "Unit price");
        this.validatePrice(props.totalPrice, "Total price");
        if (props.fromStockId) this.validateString(props.fromStockId, "From stock id")
        if (props.toStockId) this.validateString(props.toStockId, "To stock id");
        this.validateString(props.productStockId, "Product stock id");
        this.validateString(props.userId, "User id");

        this._id = props.id;
        this._type = props.type;
        this._unitPrice = props.unitPrice;
        this._totalPrice = props.totalPrice;

        this._fromStockId = props.fromStockId;
        this._toStockId = props.toStockId;
        this._productStockId = props.productStockId;
        this._quantity = props.quantity;
        this._userId = props.userId;

        this._fromStock = props.fromStock;
        this._toStock = props.toStock;
        this._productStock = props.productStock;
        this._user = props.user;

        this._createdAt = props.createdAt;
        this._updatedAt = props.updatedAt;
        this._deletedAt = props.deletedAt;
    }

    static create(props: {
        id: string,
        type: StockMovimentType,
        unitPice: number,
        totalPrice: number,
        quantity: number,
        fromStockId?: string,
        toStockId?: string,
        productStockId: string,
        userId: string,
    }): StockMoviment {
        const now = new Date();

        return new StockMoviment({
            id: props.id,
            type: props.type,
            unitPrice: props.unitPice,
            totalPrice: props.totalPrice,
            quantity: props.quantity,
            fromStockId: props.fromStockId,
            toStockId: props.toStockId,
            productStockId: props.productStockId,
            userId: props.userId,
            createdAt: now,
            updatedAt: now,
            deletedAt: undefined,
        })
    }

    static restore(props: StockMovimentProps): StockMoviment {
        return new StockMoviment(props);
    }

    get id(): string {
        return this._id;
    }

    get type(): StockMovimentType {
        return this._type;
    }

    get unitPrice(): number {
        return this._unitPrice;
    }


    get totalPrice(): number {
        return this._totalPrice;
    }

    get quantity(): number {
        return this._quantity;
    }

    get fromStockId(): string | undefined {
        return this._fromStockId;
    }

    get toStockId(): string | undefined {
        return this._toStockId;
    }

    get productStockId(): string {
        return this._productStockId;
    }

    get userId(): string {
        return this._userId;
    }

    get createdAt(): Date {
        return new Date(this._createdAt);
    }

    get updatedAt(): Date {
        return new Date(this._updatedAt);
    }

    get deletedAt(): Date | undefined {
        return this._deletedAt;
    }

    get toStock(): Stock | undefined {
        return this._toStock;
    }

    get fromStock(): Stock | undefined {
        return this._fromStock;
    }

    get productStock(): ProductStock | undefined {
        return this._productStock;
    }

    get user(): User | undefined {
        return this._user;
    }

    toJSON() {
        return {
            id: this._id,
            type: this._type,
            unitPrice: this._unitPrice,
            totalPrice: this._totalPrice,
            quantity: this._quantity,
            fromStockId: this._fromStockId,
            toStockId: this._toStockId,
            productStockId: this._productStockId,
            userId: this._userId,
            // Serialização condicional das relações
            fromStock: this._fromStock ? this._fromStock.toJSON() : undefined,
            toStock: this._toStock ? this._toStock.toJSON() : undefined,
            productStock: this._productStock ? this._productStock.toJSON() : undefined,
            user : this._user ? this._user.toJSON() : undefined,
            createdAt: this._createdAt,
            updatedAt: this._updatedAt,
            deletedAt: this._deletedAt,
        };
    }

    private validateString(data: string, propName: string) {
        if (!data?.trim()) throw new ValidationError(`${propName} cannot be empty`)
    }

    private validatePrice(price: number, propName: string) {
        if (price <= 0 || !Number.isFinite(price)) throw new ValidationError(`${propName} cannot be empty`)
    }
}