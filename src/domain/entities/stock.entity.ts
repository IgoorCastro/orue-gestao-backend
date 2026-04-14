// entidade do estoque
import { StockType } from "../enums/stock-type.enum";
import { ValidationError } from "../errors/validation.error";
import normalizeName from "../utils/normalize-name";
import { Store } from "./store.entity";

type StockProps = Readonly<{
    id: string,
    name: string,
    type: StockType,

    store?: Store,
    storeId?: string,

    createdAt: Date,
    updatedAt: Date,
    deletedAt?: Date,
}>

export class Stock {
    private readonly _id: string;
    private _name: string;
    private _type: StockType;

    private _storeId?: string;

    private _store?: Store;

    private _createdAt: Date;
    private _updatedAt: Date;
    private _deletedAt?: Date;

    private constructor(input: StockProps) {
        if (!input.id?.trim()) throw new ValidationError("Id cannot be empty");
        Stock.validateName(input.name);
        this.validateType(input.type, input.storeId);
        if (input.storeId) this.validateStoreId(input.storeId);

        this._id = input.id;
        this._name = input.name;
        this._type = input.type;

        this._storeId = input.storeId;

        this._store = input.store;

        this._createdAt = input.createdAt;
        this._updatedAt = input.updatedAt;
        this._deletedAt = input.deletedAt;
    }

    // utilizar para criar uma nova instancia
    static create(props: { id: string, name: string, type: StockType, storeId?: string }): Stock {
        const now = new Date();

        return new Stock({
            id: props.id,
            name: Stock.formatName(props.name),
            storeId: props.storeId,
            type: props.type,
            createdAt: now,
            updatedAt: now,
            deletedAt: undefined,
        });
    }

    // utilizar com pesquisas
    static restore(props: StockProps): Stock {
        return new Stock(props);
    }

    get id(): string {
        return this._id;
    }

    get storeId(): string | undefined {
        return this._storeId;
    }

    changeStoreId(storeId: string): void {
        if (this._storeId === storeId) return;
        this.validateStoreId(storeId);

        this._storeId = storeId;
        this.touch();
    }

    get name(): string {
        return this._name;
    }

    // altera o nome do estoque
    rename(name: string): void {
        this.ensureNotDeleted();
        const formattedName = Stock.formatName(name);
        if (formattedName === this._name) return;

        this._name = formattedName;
        this.touch();
    }

    // retorna true para um estoque tipo MAIN
    isMainStock(): boolean {
        return this._type === StockType.MAIN;
    }

    get type(): StockType {
        return this._type;
    }

    changeType(type: StockType): void {
        if (this._type === type) return;
        this.validateType(type);

        this._type = type;
        this.touch();
    }

    // altera o tipo do estoque para STORE
    setAsStoreStock(storeId: string): void {
        if (this._type === StockType.STORE && this._storeId === storeId) return;
        this.validateStoreId(storeId);

        this._type = StockType.STORE;
        this._storeId = storeId;
        this.touch();
    }

    // altera o tipo do estoque para MAIN
    setAsMainStock(): void {
        if (this._type === StockType.MAIN) return;

        this._type = StockType.MAIN;
        this._storeId = undefined;
        this.touch();
    }

    get store(): Store | undefined {
        return this._store;
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

    // soft delete do estoque
    delete(): void {
        this.ensureNotDeleted();

        this._deletedAt = new Date();
        this.touch();
    }

    // reativa o estoque
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
            name: this._name,
            type: this._type,
            storeId: this._storeId,
            store: this._store ? this._store.toJSON() : undefined,
            createdAt: this._createdAt,
            updatedAt: this._updatedAt,
            deletedAt: this._deletedAt,
        };
    }

    private static validateName(name: string): void {
        if (!name?.trim()) throw new ValidationError("Name cannot be empty");
    }

    private validateStoreId(storeId: string): void {
        if (!storeId?.trim()) throw new ValidationError("Store Id cannot be empty");
    }

    private validateType(type: StockType, storeId?: string): void {
        // apenas 2 tipos de estoques
        if (!Object.values(StockType).includes(type)) throw new ValidationError("Stock type is invalid");
        // stoque de loja precisa ter a referencia da mesma
        if (type === StockType.STORE && !storeId) throw new ValidationError("Store stock must have storeId")
    }

    private static formatName(name: string): string {
        const normalized = normalizeName(name);
        Stock.validateName(normalized);

        return normalized;
    }

    private ensureNotDeleted(): void {
        if (!this.isActive) throw new ValidationError("Stock is deleted");
    }

    private touch(): void {
        this._updatedAt = new Date();
    }
}