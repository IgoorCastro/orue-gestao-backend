import capitalizeFirstLetter from "../utils/capitalize-first-letter";

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
        if (!props.id || props.id.trim().length === 0) throw new Error("Id cannot be empty");
        this.validateName(props.name);

        this._id = props.id;
        this._name = capitalizeFirstLetter(props.name);
        this._createdAt = props.createdAt;
        this._updatedAt = props.updatedAt;
        this._deletedAt = props.deletedAt;
    }

    static create(props: { id: string, name: string }): Model {
        const now = new Date();

        return new Model({
            id: props.id,
            name: props.name,
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
        if (this._deletedAt) throw new Error("Model already deleted");

        this._deletedAt = new Date();
        this.touch();
    }

    restoreDeleted(): void {
        this._deletedAt = undefined;
        this.touch();
    }

    private validateName(name: string) {
        if (!name || name.trim().length === 0) throw new Error("Model cannot be empty");
    }

    private touch(): void {
        this._updatedAt = new Date();
    }
}