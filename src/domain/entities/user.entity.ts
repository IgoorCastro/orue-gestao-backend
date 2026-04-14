// entidade do usuario
import { UserRole } from "../enums/user-role.enum";
import { ValidationError } from "../errors/validation.error";
import capitalizeFirstLetter from "../utils/capitalize-first-letter";
import normalizeName from "../utils/normalize-name";
import { Password } from "../value-objects/password.vo";

// readonly para garantir a imutabilidade da entrada
// props chegam, são validadas e não mudam!
type UserProps = Readonly<{
    id: string,
    name: string,
    nickname: string,
    normalizedName: string,
    password: Password,
    role: UserRole,
    createdAt: Date,
    updatedAt: Date,
    deletedAt?: Date,
}>

export class User {
    private readonly _id: string;
    private _name: string;
    private _nickname: string;
    private _normalizedName: string;
    private _password: Password;
    private _role: UserRole;
    private _createdAt: Date;
    private _updatedAt: Date;
    private _deletedAt?: Date;

    private constructor(props: UserProps) {
        if (!props.id?.trim()) throw new ValidationError("Id cannot be empty");
        this.validateRole(props.role);
        User.validatePassword(props.password);
        User.validateNickname(props.nickname);
        User.validateName(props.name);


        this._id = props.id;
        this._name = props.name;
        this._password = props.password;
        this._nickname = props.nickname;
        this._normalizedName = props.normalizedName;
        this._role = props.role;
        this._createdAt = props.createdAt;
        this._updatedAt = props.updatedAt;
        this._deletedAt = props.deletedAt;
    }

    // utilizar para criar uma nova entidade
    static create(props: {
        id: string, name: string, password: Password, nickname: string, role: UserRole
    }): User {
        console.log(props)
        const now = new Date();

        return new User({
            id: props.id,
            name: User.formatName(props.name),
            normalizedName: User.formatNormalizedName(props.name),
            password: props.password,
            nickname: props.nickname.toLowerCase(),
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

    // altera e valida o nome
    // normalizedName tbm deve ser alterado
    // aletração de nome deve refletir no normalizedNome
    rename(name: string): void {
        this.ensureNotDeleted();
        const normalizedName = User.formatNormalizedName(name);
        const capitalizedName = User.formatName(name);
        if (normalizedName === this._normalizedName) return;
        if (capitalizedName === this._name) return;

        this._name = capitalizedName;
        this._normalizedName = normalizedName;
        this.touch();
    }

    get normalizedName(): string {
        return this._normalizedName;
    }

    get password(): Password {
        return this._password;
    }

    changePassword(password: Password): void {
        this.ensureNotDeleted();
        User.validatePassword(password);

        this._password = password;
    }

    get nickname(): string {
        return this._nickname;
    }

    changeNickname(nickname: string): void {
        this.ensureNotDeleted();
        User.validateNickname(nickname);

        this._nickname = normalizeName(nickname);
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
        if (this._role === UserRole.ADMIN) throw new Error("Cannot delete admin user");
        this.ensureNotDeleted();

        this._deletedAt = new Date();
        this.touch();
    }

    // reativa o estoque
    restoreDeleted(): void {
        if (this.isActive()) return;

        this._deletedAt = undefined;
        this.touch();
    }

    // true para estoque desativado
    isActive(): boolean {
        return !this._deletedAt;
    }

    toJSON() {
        return {
            id: this._id,
            name: this._name,
            nickname: this._nickname,
            normalizedName: this._normalizedName,
            role: this._role,
            createdAt: this._createdAt,
            updatedAt: this._updatedAt,
            deletedAt: this._deletedAt,
            // Password omitida propositalmente por segurança
        };
    }

    private static validateName(name: string): void {
        if (!name?.trim() || name === undefined) throw new ValidationError("Name cannot be empty");
        if (name.trim().length < 3) throw new ValidationError("Name must be at least 3 characters");
    }

    private static validatePassword(password: Password): void {
        if (!password.getValue()?.trim() || password === undefined) throw new ValidationError("Password cannot be empty");
    }

    private static validateNickname(nickname: string): void {
        if (!nickname?.trim() || nickname === undefined) throw new ValidationError("Nickname cannot be empty");
        if (nickname.trim().length < 2) throw new ValidationError("Nickname must be at least 3 characters");
    }

    // altera a primeira letra do name
    private static formatName(name: string): string {
        const normalized = capitalizeFirstLetter(name);
        User.validateName(normalized);

        return normalized;
    }

    // formata todo o name para padronizar no db
    private static formatNormalizedName(name: string): string {
        const normalized = normalizeName(name);
        User.validateName(normalized);

        return normalized;
    }

    private validateRole(role: UserRole): void {
        if (!Object.values(UserRole).includes(role)) throw new ValidationError("Role is invalid");
    }

    private ensureNotDeleted(): void {
        if (!this.isActive) throw new ValidationError("User is deleted");
    }

    private touch(): void {
        this._updatedAt = new Date();
    }
};