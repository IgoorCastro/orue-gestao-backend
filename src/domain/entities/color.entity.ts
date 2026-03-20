import capitalizeFirstLetter from "../utils/capitalize-first-letter";

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
        if (!id || id.trim().length === 0) throw new Error("Id cannot be empty");
        this.validateName(name);

        this._id = id;
        this._name = capitalizeFirstLetter(name);
        this._createdAt = createdAt;
        this._updatedAt = updatedAt;
        this._deletedAt = deletedAt;
    }

    // CREATE (novo objeto)
    static create(props: { id: string; name: string }): Color {
        const now = new Date();

        return new Color({
            id: props.id,
            name: props.name,
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
        const formattedName = capitalizeFirstLetter(name);

        if (this._name === formattedName) return;

        this.validateName(name);
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
        if (this._deletedAt) throw new Error("Color already deleted");

        this._deletedAt = new Date();
        this.touch();
    }

    // reativar
    restoreDeleted(): void {
        this._deletedAt = undefined;
        this.touch();
    }

    private validateName(name: string): void {
        if (!name || name.trim().length === 0) {
            throw new Error("Color name cannot be empty");
        }
    }

    private touch(): void {
        this._updatedAt = new Date();
    }
}