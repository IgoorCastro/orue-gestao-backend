// entidade do estoque
import { StockType } from "../enums/stock-type.enum";

type StockProps = Readonly<{
    id: string,
    name: string,
    isActive: boolean,
    type: StockType,
    storeId?: string,
    createdAt: Date,
    updatedAt: Date,
    deletedAt?: Date,
}>

export class Stock {
    private readonly _id: string;
    private _storeId?: string;
    private _name: string;
    private _isActive: boolean = true;
    private _type: StockType;
    private _createdAt: Date;
    private _updatedAt: Date;
    private _deletedAt?: Date;

    private constructor(input: StockProps) {
        if (!input.id || input.id.trim().length === 0) throw new Error("Id cannot be empty");
        this.validateName(input.name);
        this.validateType(input.type, input.storeId);
        if (input.storeId) this.validateStoreId(input.storeId);

        this._id = input.id;
        this._name = input.name;
        this._isActive = input.isActive;
        this._type = input.type;
        this._storeId = input.storeId;
        this._createdAt = input.createdAt;
        this._updatedAt = input.updatedAt;
        this._deletedAt = input.deletedAt;
    }

    static create(props: { id: string, name: string, type: StockType, storeId?: string }): Stock {
        const now = new Date();

        return new Stock({
            id: props.id,
            name: props.name,
            storeId: props.storeId,
            type: props.type,
            isActive: true,
            createdAt: now,
            updatedAt: now,
            deletedAt: undefined,
        });
    }

    static restore(props: StockProps): Stock {
        return new Stock(props);
    }

    get id(): string {
        return this._id;
    }

    get storeId(): string | undefined {
        return this._storeId;
    }

    get name(): string {
        return this._name;
    }

    rename(name: string): void {
        if (name === this._name) return;
        this.validateName(name);

        this._name = name;
        this.touch();
    }

    isActive(): boolean {
        return this._isActive;
    }

    activate(): void {
        if (this._isActive) return;

        this._isActive = true;
        this.touch();
    }

    deactivate(): void {
        if (!this._isActive) return;

        this._isActive = false;
        this.touch();
    }

    isMainStock(): boolean {
        return this._type === StockType.MAIN;
    }

    get type(): StockType {
        return this._type;
    }

    setAsStoreStock(storeId: string): void {
        this.validateStoreId(storeId);

        this._type = StockType.STORE;
        this._storeId = storeId;
        this.touch();
    }

    setAsMainStock(): void {
        this._type = StockType.MAIN;
        this._storeId = undefined;
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

    private validateName(name: string): void {
        if (!name || name.trim().length === 0) throw new Error("Name cannot be empty");
    }

    private validateStoreId(storeId: string): void {
        if (!storeId || storeId.trim().length === 0) throw new Error("Store Id cannot be empty");
    }

    private validateType(type: StockType, storeId?: string): void {
        // apenas 2 tipos de estoque
        if (!Object.values(StockType).includes(type)) throw new Error("Stock type is invalid");
        // stoque de loja precisa ter a referencia da mesma
        if (type === StockType.STORE && !storeId) throw new Error("Store stock must have storeId")
    }

    private touch(): void {
        this._updatedAt = new Date();
    }
}