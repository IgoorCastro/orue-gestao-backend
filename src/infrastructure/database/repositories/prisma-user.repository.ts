import { PrismaClient, UserRole as PrismaUserRole, User as PrismaUser, Prisma } from "@/generated/prisma/client";
import { User } from "@/src/domain/entities/user.entity";
import { UserRepository } from "@/src/domain/repositories/user.repository";
import { UserRole } from "@/src/domain/enums/user-role.enum";
import { Password } from "@/src/domain/value-objects/password.vo";
import normalizeName from "@/src/domain/utils/normalize-name";

export class PrismaUserRepository implements UserRepository {
    constructor(private readonly prisma: PrismaClient) { }

    async findById(id: string): Promise<User | null> {
        const user = await this.prisma.user.findUnique({
            where: { id }
        });

        if (!user) return null;

        return this.toDomain(user);
    }

    async findByName(name: string): Promise<User[]> {
        const users = await this.prisma.user.findMany({
            where: {
                normalizedName: {
                    contains: normalizeName(name),
                    mode: "insensitive"
                }
            }
        });

        return users.map(user => this.toDomain(user));
    }

    async findByNickname(nickname: string): Promise<User | null> {
        const user = await this.prisma.user.findFirst({
            where: {
                nickname: {
                    equals: nickname,
                    mode: "insensitive",
                }
            },
        })

        if(!user) return null;

        return this.toDomain(user);
    }

    async findByRole(role: PrismaUserRole): Promise<User[]> {
        const users = await this.prisma.user.findMany({
            where: { role, deletedAt: null }
        });

        return users.map(this.toDomain);
    }

    // find com filtro
    // retorna uma lista de usuarios e pode ser filtrada
    async findMany(filters: { name?: string; role?: UserRole; nickname?: string; }): Promise<User[]> {
        const users = await this.prisma.user.findMany({
            where: {
                normalizedName: filters.name
                    ? { contains: normalizeName(filters.name), mode: "insensitive" }
                    : undefined,
                nickname: filters.nickname
                    ? { contains: filters.nickname, mode: "insensitive" }
                    : undefined,
                role: filters.role ?? undefined,
            },
        });

        return users.map(user => this.toDomain(user));
    }

    async findAll(): Promise<User[]> {
        const users = await this.prisma.user.findMany({
            where: { deletedAt: null }
        });

        return users.map(this.toDomain);
    }

    async existsByName(name: string): Promise<boolean> {
        const count = await this.prisma.user.count({
            where: {
                name: {
                    equals: name,
                    mode: "insensitive"
                }
            }
        });

        return count > 0;
    }

    async existsByNickname(nickname: string): Promise<boolean> {
        const count = await this.prisma.user.count({
            where: {
                nickname: {
                    equals: nickname,
                    mode: "insensitive"
                }
            }
        });

        return count > 0;
    }

    async save(user: User): Promise<void> {
        await this.prisma.user.upsert({
            where: { id: user.id },
            update: this.toPrismaUpdate(user),
            create: this.toPrismaCreate(user),
        });
    }

    // =========================
    // MAPPERS
    // =========================

    private toDomain(prismaUser: PrismaUser): User {
        return User.restore({
            id: prismaUser.id,
            name: prismaUser.name,
            normalizedName: prismaUser.normalizedName,
            password: Password.restore(prismaUser.password), // string para Password 
            nickname: prismaUser.nickname,
            role: this.mapRoleToDomain(prismaUser.role),
            createdAt: prismaUser.createdAt,
            updatedAt: prismaUser.updatedAt,
            deletedAt: prismaUser.deletedAt ?? undefined,
        });
    }

    private toPrismaUpdate(user: User): Prisma.UserUpdateInput {
        return {
            name: user.name,
            normalizedName: user.normalizedName,
            nickname: user.nickname,
            password: user.password.getValue(), // Password para string
            role: user.role as PrismaUserRole,
            updatedAt: user.updatedAt,
            deletedAt: user.deletedAt ?? null,
        };
    }

    private toPrismaCreate(user: User): Prisma.UserCreateInput {
        return {
            id: user.id,
            name: user.name,
            normalizedName: user.normalizedName,
            password: user.password.getValue(),
            nickname: user.nickname,
            role: user.role as PrismaUserRole,
        };
    }

    // converte type do prisma para o enum do sistema
    private mapRoleToDomain(role: PrismaUserRole): UserRole {
        return role as UserRole;
    }
}