import { ValidationError } from "../errors/validation.error";
import capitalizeFirstLetter from "../utils/capitalize-first-letter";
import normalizeName from "../utils/normalize-name";

type MaterialProps = Readonly<{
    id: string;
    name: string,
    normalizedName: string,
    createdAt: Date,
    updatedAt: Date,
    deletedAt?: Date,
}>

// material do produto (100% algodão / 80% algodão, 20% poliester)
export class Material {
    private readonly _id: string;
    private _name: string;
    private _normalizedName: string;
    private _createdAt: Date;
    private _updatedAt: Date;
    private _deletedAt?: Date;

    private constructor(props: MaterialProps) {
        if (!props.id?.trim()) throw new ValidationError("Id cannot be empty");
        // manter o validate para testar o restore!
        Material.validateName(props.name);

        this._id = props.id;
        this._name = props.name;
        this._normalizedName = props.normalizedName;
        this._createdAt = props.createdAt;
        this._updatedAt = props.updatedAt;
        this._deletedAt = props.deletedAt;
    }

    // create (novo material)
    static create(props: { id: string, name: string }): Material {
        const now = new Date();

        return new Material({
            id: props.id,
            name: Material.formatName(props.name),
            normalizedName: Material.formatNormalizedName(props.name),
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

    // altera e valida o nome
    // normalizedName tbm deve ser alterado
    // aletração de nome deve refletir no normalizedNome
    rename(name: string): void {
        this.ensureNotDeleted();
        const capitalizedName = Material.formatName(name);
        const normalizedName = Material.formatNormalizedName(name);
        if (normalizedName === this._normalizedName) return;
        if (capitalizedName === this._name) return;

        this._name = capitalizedName;
        this._normalizedName = normalizedName;
        this.touch();
    }

    get normalizedName(): string {
        return this._normalizedName;
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
        if (!this._deletedAt) return;

        this._deletedAt = undefined;
        this.touch();
    }

    isActive(): boolean {
        return !this._deletedAt;
    }

    toJSON() {
        return {
            id: this.id,
            name: this.name,
            normalizedName: this.normalizedName,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt,
            deletedAt: this.deletedAt,
        };
    }

    private static validateName(name: string): void {
        if (!name?.trim()) throw new ValidationError("Material name cannot be empty");
    }

    // altera a primeira letra do name
    private static formatName(name: string): string {
        const normalized = capitalizeFirstLetter(name);
        Material.validateName(normalized);

        return normalized;
    }

    // formata todo o name para padronizar no db
    private static formatNormalizedName(name: string): string {
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