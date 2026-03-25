// entidade do usuario
import { UserRole } from "../enums/user-role.enum";
import { ValidationError } from "../errors/validation.error";
import capitalizeFirstLetter from "../utils/capitalize-first-letter";
import normalizeName from "../utils/normalize-name";

// readonly para garantir a imutabilidade da entrada
// props chegam, são validadas e não mudam!
type UserProps = Readonly<{
    id: string,
    name: string,
    role: UserRole,
    createdAt: Date,
    updatedAt: Date,
    deletedAt?: Date,
}>

export class User {
    private readonly _id: string;
    private _name: string;
    private _role: UserRole;
    private _createdAt: Date;
    private _updatedAt: Date;
    private _deletedAt?: Date;

    private constructor(props: UserProps) {
        if (!props.id?.trim()) throw new ValidationError("Id cannot be empty");
        this.validateRole(props.role);
        User.validateName(props.name);
        

        this._id = props.id;
        this._name = props.name;
        this._role = props.role;
        this._createdAt = props.createdAt;
        this._updatedAt = props.updatedAt;
        this._deletedAt = props.deletedAt;
    }

    // utilizar para criar uma nova entidade
    static create(props: { id: string, name: string, role: UserRole }): User {
        const now = new Date();

        return new User({
            id: props.id,
            name: User.formatName(props.name),
            role: props.role,
            createdAt: now,
            updatedAt: now,
            deletedAt: undefined,
        });
    }

    // utilizar com uma entidade do repositorio
    static restore(props: UserProps): User {
        return new User(props);
    }

    get id(): string {
        return this._id;
    }

    get name(): string {
        return this._name;
    }

    rename(name: string): void {
        this.ensureNotDeleted();
        const formattedName = User.formatName(name);
        if (formattedName === this._name) return;

        this._name = formattedName;
        this.touch();
    }

    get role(): UserRole {
        return this._role;
    }

    changeRole(role: UserRole): void {
        this.ensureNotDeleted();
        if (this._role === UserRole.ADMIN) throw new ValidationError("Admin role cannot be changed");
        if (role === this._role) return;
        this.validateRole(role);

        this._role = role;
        this.touch();
    }

    // uso: user.hasRole(UserRole.ADMIN)
    hasRole(role: UserRole): boolean {
        return this._role === role;
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

    // true para estoque desativado
    isActive(): boolean {
        return !this._deletedAt;
    }

    private static validateName(name: string): void {
        if (!name?.trim()) throw new ValidationError("Name cannot be empty");
        if (name.trim().length < 3) throw new ValidationError("Name must be at least 3 characters");
    }

    private static formatName(name: string): string {
        const normalized = normalizeName(name);
        User.validateName(normalized);

        return normalized;
    }

    private validateRole(role: UserRole): void {
        if (!Object.values(UserRole).includes(role)) throw new ValidationError("Role is invalid");
    }

    private ensureNotDeleted(): void {
        if (!this.isActive) throw new ValidationError("Product is deleted");
    }

    private touch(): void {
        this._updatedAt = new Date();
    }
};