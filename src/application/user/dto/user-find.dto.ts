import { UserRole } from "@/src/domain/enums/user-role.enum";

export type FindUserByIdInputDto = Readonly<{
    id: string;
}>;

export type FindUserByNameInputDto = Readonly<{
    name: string;
}>;

export type FindUserByRoleInputDto = Readonly<{
    role: UserRole;
}>;

export type FindUserFilteredDto = Readonly<{
    name?: string,
    role?: UserRole,
    nickname?: string,
}>

export type FindUserOutputDto = Readonly<{
    id: string;
    name: string;
    nickname: string,
    role: UserRole;
    createdAt: Date;
    updatedAt: Date,
    deletedAt?: Date,
}>;