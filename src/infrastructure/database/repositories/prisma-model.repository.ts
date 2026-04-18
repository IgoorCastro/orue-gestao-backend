import { PrismaClient, Prisma, Model as PrismaModel } from "@/generated/prisma/client";
import { Model } from "@/src/domain/entities/model.entity";
import { ModelRepository } from "@/src/domain/repositories/model.repository";
import normalizeName from "@/src/domain/utils/normalize-name";

export class PrismaModelRepository implements ModelRepository {

    constructor(private readonly prisma: PrismaClient) { }

    async findById(id: string): Promise<Model | null> {
        const model = await this.prisma.model.findFirst({
            where: { id },
        })

        if (!model) return null;

        return this.toDomain(model);
    }

    async findByName(name: string): Promise<Model[]> {
        const models = await this.prisma.model.findMany({
            where: {
                normalizedName: {
                    contains: normalizeName(name),
                    mode: "insensitive",
                },
                deletedAt: null
            }
        });

        return models.map(this.toDomain);
    }

    async findAll(): Promise<Model[]> {
        const models = await this.prisma.model.findMany({
            where: { deletedAt: null },
        });

        return models.map(this.toDomain);
    }

    // retorna all caso faltar o filtro
    async findMany(filters: { name?: string; }): Promise<Model[]> {
        const materials = await this.prisma.model.findMany({
            where: {
                normalizedName: filters.name
                    ? { contains: normalizeName(filters.name), mode: "insensitive" }
                    : undefined,
            },
            orderBy: { name: "asc" }
        })

        return materials.map(m => this.toDomain(m));
    }

    async findByNames(names: string[]): Promise<Model[]> {
            if (!names.length) return [];
    
            const models = await this.prisma.model.findMany({
                where: {
                    OR: names.map(name => ({
                        name: {
                            equals: name,
                            mode: "insensitive"
                        }
                    }))
                }
            });
    
            return models.map(m => this.toDomain(m));
        }

    async existsByName(name: string): Promise<boolean> {
        const exists = await this.prisma.model.findFirst({
            where: { normalizedName: { equals: normalizeName(name), mode: "insensitive" } },
            select: { id: true },
        });
        return !!exists;
    }

    async save(model: Model): Promise<void> {
        await this.prisma.model.upsert({
            where: { id: model.id },
            update: this.toPrismaUpdate(model),
            create: this.toPrismaCreate(model),
        })
    }

    // =========================
    // MAPPERS
    // =========================

    private toDomain(prismaModel: PrismaModel): Model {
        return Model.restore({
            id: prismaModel.id,
            name: prismaModel.name,
            normalizedName: prismaModel.normalizedName,
            createdAt: prismaModel.createdAt,
            updatedAt: prismaModel.updatedAt,
            deletedAt: prismaModel.deletedAt ?? undefined,
        });
    }

    private toPrismaUpdate(model: Model): Prisma.ModelUpdateInput {
        return {
            name: model.name,
            normalizedName: model.normalizedName,
            updatedAt: model.updatedAt,
            deletedAt: model.deletedAt ?? null,
        };
    }

    private toPrismaCreate(model: Model): Prisma.ModelCreateInput {
        return {
            id: model.id,
            normalizedName: model.normalizedName,
            name: model.name,
        };
    }
}