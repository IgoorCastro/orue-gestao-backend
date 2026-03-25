import { ValidationError } from "../errors/validation.error";
import capitalizeFirstLetter from "../utils/capitalize-first-letter";
import normalizeName from "../utils/normalize-name";

// entidade de cores do produto (amarelo, verde, azul..)
type ColorProps = Readonly<{
    id: string;
    name: string;
    createdAt: Date;
    updatedAt: Date;
    deletedAt?: Date;
}>;

export class Color {
    private readonly _id: string;
    private _name: string;
    private _createdAt: Date;
    private _updatedAt: Date;
    private _deletedAt?: Date;

    // constructor é interno
    private constructor({ id, name, createdAt, updatedAt, deletedAt }: ColorProps) {
        if (!id?.trim()) throw new ValidationError("Id cannot be empty");
        // manter o validate para testar o restore!
        Color.validateName(name);

        this._id = id;
        this._name = name;
        this._createdAt = createdAt;
        this._updatedAt = updatedAt;
        this._deletedAt = deletedAt;
    }

    // CREATE (novo objeto)
    static create(props: { id: string; name: string }): Color {
        const now = new Date();

        return new Color({
            id: props.id,
            name: Color.formatName(props.name),
            createdAt: now,
            updatedAt: now,
            deletedAt: undefined,
        });
    }

    // RESTORE (vindo do banco)
    static restore(props: ColorProps): Color {
        return new Color(props);
    }

    get id(): string {
        return this._id;
    }

    get name(): string {
        return this._name;
    }

    rename(name: string): void {
        this.ensureNotDeleted();
        const formattedName = Color.formatName(name);
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

    // soft delete
    delete(): void {
        this.ensureNotDeleted();

        this._deletedAt = new Date();
        this.touch();
    }

    // reativar
    restoreDeleted(): void {
        if(!this._deletedAt) return;

        this._deletedAt = undefined;
        this.touch();
    }

    isActive(): boolean {
        return !this._deletedAt;
    }

    private static validateName(name: string) {
        if(!name?.trim()) throw new ValidationError("Color cannot be empty");
    }

    private static formatName(name: string): string {
        const normalized = normalizeName(name);
        Color.validateName(normalized);

        return normalized;
    }

    private ensureNotDeleted(): void {
        if (!this.isActive) throw new ValidationError("Color is deleted");
    }

    private touch(): void {
        this._updatedAt = new Date();
    }
}