import capitalizeFirstLetter from "../utils/capitalize-first-letter";

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
        if(!props.id || props.id.trim().length === 0) throw new Error("Id is required");
        this.validateName(props.name);

        this._id = props.id;
        this._name = capitalizeFirstLetter(props.name);
        this._createdAt = props.createdAt;
        this._updatedAt = props.updatedAt;
        this._deletedAt = props.deletedAt;
    }

    static create(props: { id: string, name: string }): Store {
        const now = new Date();
        return new Store({
            id: props.id,
            name: props.name,
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

    rename(name: string): void {
        if(name === this._name) return;
        this.validateName(name);

        this._name = capitalizeFirstLetter(name);
        this.touch();
    }

    private validateName(name: string) {
        if (!name || name.trim().length === 0) throw new Error("Name cannot be empty")
    }

    private touch(): void {
        this._updatedAt = new Date();
    }
}