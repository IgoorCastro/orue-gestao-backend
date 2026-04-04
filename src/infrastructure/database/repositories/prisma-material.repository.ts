import { PrismaClient, Prisma, Material as PrismaMaterial } from "@/generated/prisma/client";
import { Material } from "@/src/domain/entities/material.entity";
import { MaterialRepository } from "@/src/domain/repositories/material.repository";
import normalizeName from "@/src/domain/utils/normalize-name";

export class PrismaMaterialRepository implements MaterialRepository {
    constructor(private readonly prisma: PrismaClient) { }

    async findById(id: string): Promise<Material | null> {
        const material = await this.prisma.material.findFirst({
            where: { id },
        });

        if (!material) return null;

        return this.toDomain(material);
    }

    async findByName(name: string): Promise<Material[]> {
        const materials = await this.prisma.material.findMany({
            where: {
                normalizedName: {
                    contains: normalizeName(name),
                    mode: "insensitive",
                }
            }
        });

        return materials.map(this.toDomain);
    }

    async findByNames(names: string[]): Promise<Material[]> {
            if (!names.length) return [];
    
            const materials = await this.prisma.material.findMany({
                where: {
                    OR: names.map(name => ({
                        name: {
                            equals: name,
                            mode: "insensitive"
                        }
                    }))
                }
            });
    
            return materials.map(m => this.toDomain(m));
        }

    async findAll(): Promise<Material[]> {
        const materials = await this.prisma.material.findMany({
            where: { deletedAt: null }
        });

        return materials.map(this.toDomain);
    }

    // retorna all caso faltar o filtro
    async findMany(filters: { name?: string; }): Promise<Material[]> {
        const materials = await this.prisma.material.findMany({
            where: {
                normalizedName: filters.name
                    ? { contains: normalizeName(filters.name), mode: "insensitive" }
                    : undefined,
            }
        })

        return materials.map(m => this.toDomain(m));
    }

    async existsByName(name: string): Promise<boolean> {
        const exists = await this.prisma.material.findFirst({
            where: {
                normalizedName: { equals: normalizeName(name), mode: "insensitive" },
            },
            select: { id: true },
        });
        return !!exists;
    }

    async existsById(id: string): Promise<boolean> {
        const exists = await this.prisma.material.findUnique({ where: { id } });
        return !!exists;
    }

    async findByIds(ids: string[]): Promise<Material[]> {
        if (!ids.length) return [];

        const materials = await this.prisma.material.findMany({
            where: { id: { in: ids } }
        });

        return materials.map(this.toDomain);
    }

    async save(material: Material): Promise<void> {
        await this.prisma.material.upsert({
            where: { id: material.id },
            update: this.toPrismaUpdate(material),
            create: this.toPrismaCreate(material),
        })
    }

    // =========================
    // MAPPERS
    // =========================

    private toDomain(prismaMaterial: PrismaMaterial): Material {
        return Material.restore({
            id: prismaMaterial.id,
            name: prismaMaterial.name,
            normalizedName: prismaMaterial.normalizedName,
            createdAt: prismaMaterial.createdAt,
            updatedAt: prismaMaterial.updatedAt,
            deletedAt: prismaMaterial.deletedAt ?? undefined,
        });
    }

    private toPrismaUpdate(material: Material): Prisma.MaterialUpdateInput {
        return {
            name: material.name,
            normalizedName: material.normalizedName,
            updatedAt: material.updatedAt,
            deletedAt: material.deletedAt ?? null,
        };
    }

    private toPrismaCreate(material: Material): Prisma.MaterialCreateInput {
        return {
            id: material.id,
            name: material.name,
            normalizedName: material.normalizedName,
        };
    }
}

