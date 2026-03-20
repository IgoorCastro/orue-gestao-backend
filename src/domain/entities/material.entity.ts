import capitalizeFirstLetter from "../utils/capitalize-first-letter";

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

    private constructor({ id, name, updatedAt, deletedAt, createdAt }: MaterialProps) {
        if (!id || id.trim().length === 0) throw new Error("Id is required");
        this.validateName(name);

        this._id = id;
        this._name = capitalizeFirstLetter(name);
        this._createdAt = createdAt;
        this._updatedAt = updatedAt;
        this._deletedAt = deletedAt;
    }

    // create (novo material)
    static create(props: { id: string, name: string }): Material {
        const now = new Date();

        return new Material({
            id: props.id,
            name: props.name,
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

    delete(): void {
        if (this._deletedAt) throw new Error("Material already deleted");

        this._deletedAt = new Date();
        this.touch();
    }

    restoreDeleted(): void {
        this._deletedAt = undefined;
        this.touch();
    }

    private validateName(name: string): void {
        if (!name || name.trim().length === 0) throw new Error("Material name cannot be empty");
    }

    private touch(): void {
        this._updatedAt = new Date();
    }
}