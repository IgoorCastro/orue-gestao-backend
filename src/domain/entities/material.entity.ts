import { ValidationError } from "../errors/validation.error";
import capitalizeFirstLetter from "../utils/capitalize-first-letter";
import normalizeName from "../utils/normalize-name";

type MaterialProps = Readonly<{
    id: string;
    name: string,
    createdAt: Date,
    updatedAt: Date,
    deletedAt?: Date,
}>

// material do produto (100% algodão / 80% algodão, 20% poliester)
export class Material {
    private readonly _id: string;
    private _name: string;
    private _createdAt: Date;
    private _updatedAt: Date;
    private _deletedAt?: Date;

    private constructor({ id, name, createdAt, updatedAt, deletedAt }: MaterialProps) {
        if (!id?.trim()) throw new ValidationError("Id cannot be empty");
        // manter o validate para testar o restore!
        Material.validateName(name);

        this._id = id;
        this._name = name;
        this._createdAt = createdAt;
        this._updatedAt = updatedAt;
        this._deletedAt = deletedAt;
    }

    // create (novo material)
    static create(props: { id: string, name: string }): Material {
        const now = new Date();

        return new Material({
            id: props.id,
            name: Material.formatName(props.name),
            createdAt: now,
            updatedAt: now,
            deletedAt: undefined,
        });
    }

    // restore (novo objeto vindo do Db)
    static restore(props: MaterialProps): Material {
        return new Material(props);
    }

    get id(): string {
        return this._id;
    }

    get name(): string {
        return this._name;
    }

    rename(name: string): void {
        this.ensureNotDeleted();
        const formattedName = Material.formatName(name);
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
        if (this._deletedAt) throw new ValidationError("Material already deleted");

        this._deletedAt = new Date();
        this.touch();
    }

    restoreDeleted(): void {
        if(!this._deletedAt) return;

        this._deletedAt = undefined;
        this.touch();
    }

    isActive(): boolean {
        return !this._deletedAt;
    }

    private static validateName(name: string): void {
        if (!name?.trim()) throw new ValidationError("Material name cannot be empty");
    }

    private static formatName(name: string): string {
        const normalized = normalizeName(name);
        Material.validateName(normalized);

        return normalized;
    }

    private ensureNotDeleted(): void {
        if (!this.isActive) throw new ValidationError("Material is deleted");
    }

    private touch(): void {
        this._updatedAt = new Date();
    }
}