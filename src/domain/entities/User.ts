// entidade do usuario
import { UserRole } from "../enums/UserRole.enum";

export class User {
    constructor(
        public readonly id: string,
        public name: string,
        public role: UserRole,
        public isActive: boolean,
        public readonly createdAt: Date,
    ) {
        if(!name || name.trim().length === 0) throw new Error("Name cannot be empty");
        if(!role || !Object.values(UserRole).includes(role)) throw new Error("Role is invalid");
    }

    isUserAdmin(): boolean {
        return this.role === UserRole.ADMIN;
    }

    isUserManager(): boolean {
        return this.role === UserRole.MANAGER;
    }

    isUserOperator(): boolean {
        return this.role === UserRole.OPERATOR;
    }

    isUserActive(): boolean {
        return this.isActive;
    }
};