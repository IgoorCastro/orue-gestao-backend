import { ValidationError } from "../errors/validation.error";
import capitalizeFirstLetter from "../utils/capitalize-first-letter";
import normalizeName from "../utils/normalize-name";

// entidade de cores do produto (amarelo, verde, azul..)
type ColorProps = Readonly<{
    id: string;
    name: string;
    normalizedName: string,
    createdAt: Date;
    updatedAt: Date;
    deletedAt?: Date;
}>;

export class Color {
    private readonly _id: string;
    private _name: string;
    private _normalizedName: string;
    private _createdAt: Date;
    private _updatedAt: Date;
    private _deletedAt?: Date;

    // constructor é interno
    private constructor(props: ColorProps) {
        if (!props.id?.trim()) throw new ValidationError("Id cannot be empty");
        // manter o validate para testar o restore!
        Color.validateName(props.name);

        this._id = props.id;
        this._name = props.name;
        this._normalizedName = props.normalizedName;
        this._createdAt = props.createdAt;
        this._updatedAt = props.updatedAt;
        this._deletedAt = props.deletedAt;
    }

    // CREATE (novo objeto)
    static create(props: { id: string; name: string }): Color {
        const now = new Date();

        return new Color({
            id: props.id,
            name: Color.formatName(props.name),
            normalizedName: Color.formatNormalizedName(props.name),
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

    // altera e valida o nome
    // normalizedName tbm deve ser alterado
    // aletração de nome deve refletir no normalizedNome
    rename(name: string): void {
        this.ensureNotDeleted();
        const normalizedName = Color.formatNormalizedName(name);
        const capitalizedName = Color.formatName(name);
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


    // soft delete
    delete(): void {
        this.ensureNotDeleted();

        this._deletedAt = new Date();
        this.touch();
    }

    // reativar
    restoreDeleted(): void {
        if (this.isActive()) return;

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

    private static validateName(name: string) {
        if (!name?.trim()) throw new ValidationError("Color cannot be empty");
    }

    // altera a primeira letra do name
    private static formatName(name: string): string {
        const normalized = capitalizeFirstLetter(name);
        Color.validateName(normalized);

        return normalized;
    }

    // formata todo o name para padronizar no db
    private static formatNormalizedName(name: string): string {
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