import { UserRole } from "@/src/domain/enums/user-role.enum";
import { Password } from "@/src/domain/value-objects/password.vo";

export type CreateUserInputDTO = Readonly<{
    name: string;
    nickname: string,
    password: string,
    role: UserRole;
}>;

export type CreateUserOutputDTO = Readonly<{
    id: string;
    name: string;
    role: UserRole;
    
    createdAt: Date;
    updatedAt: Date,
    deletedAt?: Date,
}>;