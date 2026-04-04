import { PrismaClient, Prisma, Color as PrismaColor } from "@/generated/prisma/client";
import { Color } from "@/src/domain/entities/color.entity";
import { ColorRepository } from "@/src/domain/repositories/color.repository";
import normalizeName from "@/src/domain/utils/normalize-name";

export class PrismaColorRepository implements ColorRepository {

    constructor(private readonly prisma: PrismaClient) { }

    async findById(id: string): Promise<Color | null> {
        const color = await this.prisma.color.findFirst({
            where: { id },
        });

        if(!color) return null;

        return this.toDomain(color);
    }

    async findByName(name: string): Promise<Color[]> {
        // pode retornar mais de uma cor
        // exp: name: amerelo
        // return: [amarelo claro, amarelo escuro]
        console.log("NAME: ", name)
        const colors = await this.prisma.color.findMany({
            where: {
                name: {
                    equals: name,
                    mode: "insensitive",
                }
            }
        });

        return colors.map(this.toDomain);
    }

    async findByNames(names: string[]): Promise<Color[]> {
        if (!names.length) return [];

        const colors = await this.prisma.color.findMany({
            where: {
                OR: names.map(name => ({
                    name: {
                        equals: name,
                        mode: "insensitive"
                    }
                }))
            }
        });

        return colors.map(c => this.toDomain(c));
    }

    async findAll(): Promise<Color[]> {
        const colors = await this.prisma.color.findMany({
            where: { deletedAt: null }
        });

        return colors.map(this.toDomain);
    }

    async findByIds(ids: string[]): Promise<Color[]> {
        if (!ids.length) return [];

        const colors = await this.prisma.color.findMany({
            where: { id: { in: ids } }
        });

        return colors.map(this.toDomain);
    }

    // retorna all caso faltar o filtro
    async findMany(filters: { name?: string; }): Promise<Color[]> {
        const colors = await this.prisma.color.findMany({
            where: {
                normalizedName: filters.name
                    ? { contains: normalizeName(filters.name), mode: "insensitive" }
                    : undefined,
            }
        })

        return colors.map(color => this.toDomain(color));
    }

    async existsByName(name: string): Promise<boolean> {
        const exists = await this.prisma.color.findFirst({
            where: { name: { equals: name, mode: "insensitive" } },
            select: { id: true },
        });
        return !!exists;
    }

    async save(color: Color): Promise<void> {
        await this.prisma.color.upsert({
            where: { id: color.id },
            update: this.toPrismaUpdate(color),
            create: this.toPrismaCreate(color),
        })
    }

    // =========================
    // MAPPERS
    // =========================

    private toDomain(prismaColor: PrismaColor): Color {
        return Color.restore({
            id: prismaColor.id,
            name: prismaColor.name,
            normalizedName: prismaColor.normalizedName,
            createdAt: prismaColor.createdAt,
            updatedAt: prismaColor.updatedAt,
            deletedAt: prismaColor.deletedAt ?? undefined,
        });
    }

    private toPrismaUpdate(color: Color): Prisma.ColorUpdateInput {
        return {
            name: color.name,
            normalizedName: color.normalizedName,
            updatedAt: color.updatedAt,
            deletedAt: color.deletedAt ?? null,
        };
    }

    private toPrismaCreate(color: Color): Prisma.ColorCreateManyInput {
        return {
            id: color.id,
            name: color.name,
            normalizedName: color.normalizedName,
        };
    }
}