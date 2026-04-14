import { ValidationError } from "../errors/validation.error";
import capitalizeFirstLetter from "../utils/capitalize-first-letter";
import normalizeName from "../utils/normalize-name";

type StoreProps = Readonly<{
    id: string,
    name: string,
    createdAt: Date,
    updatedAt: Date,
    deletedAt?: Date,
}>;

// entidade da loja
export class Store {
    private readonly _id: string;
    private _name: string;
    private _createdAt: Date;
    private _updatedAt: Date;
    private _deletedAt?: Date;

    private constructor(props: StoreProps) {
        if (!props.id?.trim()) throw new ValidationError("Id is required");

        this._id = props.id;
        this._name = props.name;
        this._createdAt = props.createdAt;
        this._updatedAt = props.updatedAt;
        this._deletedAt = props.deletedAt;
    }

    static create(props: { id: string, name: string }): Store {
        const now = new Date();
        return new Store({
            id: props.id,
            name: Store.formatName(props.name),
            createdAt: now,
            updatedAt: now,
            deletedAt: undefined,
        });
    }

    static restore(props: StoreProps): Store {
        return new Store(props);
    }

    get id(): string {
        return this._id;
    }

    get name(): string {
        return this._name;
    }

    rename(name: string): void {
        const formattedName = Store.formatName(name);
        this.ensureNotDeleted();
        if (formattedName === this._name) return;

        this._name = formattedName;
        this.touch();
    }


    get createdAt(): Date {
        // garantindo a imutabilidade
        return new Date(this._createdAt);
    }

    get updatedAt(): Date {
        return new Date(this._updatedAt);
    }

    get deletedAt(): Date | undefined {
        return this._deletedAt ? new Date(this._deletedAt) : undefined;
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
            createdAt: this._createdAt,
            updatedAt: this._updatedAt,
            deletedAt: this._deletedAt,
        };
    }

    private static validateName(name: string) {
        if (!name?.trim()) throw new ValidationError("Name cannot be empty")
    }

    private static formatName(name: string): string {
        const normalized = normalizeName(name);
        Store.validateName(normalized);

        return normalized;
    }

    private ensureNotDeleted(): void {
        if (!this.isActive()) throw new ValidationError("Product is deleted");
    }

    private touch(): void {
        this._updatedAt = new Date();
    }
}