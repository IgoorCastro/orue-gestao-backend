import { ValidationError } from "../errors/validation.error";
import capitalizeFirstLetter from "../utils/capitalize-first-letter";
import normalizeName from "../utils/normalize-name";

type ModelProps = Readonly<{
    id: string,
    name: string,
    createdAt: Date,
    updatedAt: Date,
    deletedAt?: Date,
}>

// entidade do modelo do produto (calça, bermuda, camiseta..)
export class Model {
    private readonly _id: string;
    private _name: string;
    private _createdAt: Date;
    private _updatedAt: Date;
    private _deletedAt?: Date;

    private constructor(props: ModelProps) {
        if (!props.id?.trim()) throw new ValidationError("Id cannot be empty");
        // manter o validate para testar o restore!
        Model.validateName(props.name);

        this._id = props.id;
        this._name = props.name;
        this._createdAt = props.createdAt;
        this._updatedAt = props.updatedAt;
        this._deletedAt = props.deletedAt;
    }

    static create(props: { id: string, name: string }): Model {
        const now = new Date();

        return new Model({
            id: props.id,
            name: Model.formatName(props.name),
            createdAt: now,
            updatedAt: now,
            deletedAt: undefined,
        });
    }

    static restore(props: ModelProps): Model {
        return new Model(props);
    }

    get id(): string {
        return this._id;
    }

    get name(): string {
        return this._name;
    }

    rename(name: string): void {
        this.ensureNotDeleted();
        const formattedName = Model.formatName(name);
        if (this._name === formattedName) return;

        this._name = formattedName;
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

    private static validateName(name: string) {
        if (!name?.trim()) throw new ValidationError("Model cannot be empty");
    }

    private static formatName(name: string): string {
        const normalized = normalizeName(name);
        Model.validateName(normalized);
        return normalized;
    }

    private ensureNotDeleted(): void {
        if (!this.isActive) throw new ValidationError("Model is deleted");
    }

    private touch(): void {
        this._updatedAt = new Date();
    }
}