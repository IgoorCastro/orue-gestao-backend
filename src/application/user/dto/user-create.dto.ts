import { UserRole } from "@/src/domain/enums/user-role.enum";

export interface CreateUserInputDTO {
    name: string;
    role: UserRole;
}

export interface CreateUserOutputDTO {
    id?: string;
    name: string;
    role: UserRole;
    isActive: boolean;
    createdAt: Date;
}