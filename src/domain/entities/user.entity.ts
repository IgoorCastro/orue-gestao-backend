// entidade do usuario
import { UserRole } from "../enums/user-role.enum";
import capitalizeFirstLetter from "../utils/capitalize-first-letter";

// readonly para garantir a imutabilidade da entrada
// props chegam, são validadas e não mudam!
type UserProps = Readonly<{
    id: string,
    name: string,
    role: UserRole,
    isActive: boolean,
    createdAt: Date,
    updatedAt: Date,
    deletedAt?: Date,
}>

export class User {
    private readonly _id: string;
    private _name: string;
    private _role: UserRole;
    private _isActive: boolean;
    private _createdAt: Date;
    private _updatedAt: Date;
    private _deletedAt?: Date;

    private constructor(props: UserProps) {
        if (!props.id || props.id.trim().length === 0) throw new Error("Id cannot be empty");
        this.validateRole(props.role);
        this.validateName(props.name);

        this._id = props.id;
        this._name = capitalizeFirstLetter(props.name);
        this._role = props.role;
        this._isActive = props.isActive;
        this._createdAt = props.createdAt;
        this._updatedAt = props.updatedAt;
        this._deletedAt = props.deletedAt;
    }

    static create(props: { id: string, name: string, role: UserRole }): User {
        const now = new Date();

        return new User({
            id: props.id,
            name: props.name,
            role: props.role,
            isActive: true,
            createdAt: now,
            updatedAt: now,
            deletedAt: undefined,
        });
    }

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
        if (name === this._name) return;
        this.validateName(name);

        this._name = capitalizeFirstLetter(name);
        this.touch();
    }

    get role(): UserRole {
        return this._role;
    }

    changeRole(role: UserRole): void {
        if(this._role === UserRole.ADMIN) throw new Error("Admin role cannot be changed");
        if (role === this._role) return;
        this.validateRole(role);

        this._role = role;
        this.touch();
    }

    get isActive(): boolean {
        return this._isActive;
    }

    activate(): void {
        if (this._isActive) return;

        this._isActive = true;
        this.touch();
    }

    deactivate(): void {
        if (!this._isActive) return;

        this._isActive = false;
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

    private validateName(name: string): void {
        if (!name || name.trim().length === 0) throw new Error("Name cannot be empty");
        if (name.trim().length < 3) throw new Error("Name must be at least 3 characters");
    }

    private validateRole(role: UserRole): void {
        if (!Object.values(UserRole).includes(role)) throw new Error("Role is invalid");
    }

    private touch(): void {
        this._updatedAt = new Date();
    }
};