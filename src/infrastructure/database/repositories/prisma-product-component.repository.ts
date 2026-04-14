// repositorio da composição de produtos
// pc = product component

import { Prisma, PrismaClient, ProductComponent as PrismaProductComponent } from "@/generated/prisma/client";
import { ProductComponent } from "@/src/domain/entities/product-component";
import { ProductComponentRepository } from "@/src/domain/repositories/product-component.repository";

export class PrismaProductComponentRepository implements ProductComponentRepository {
    constructor(private readonly prisma: PrismaClient) { }

    async findById(id: string): Promise<ProductComponent | null> {
        const pc = await this.prisma.productComponent.findUnique({
            where: { id },
        })

        if (!pc) return null;

        return this.toDomain(pc);
    }

    async findAll(): Promise<ProductComponent[]> {
        const pcs = await this.prisma.productComponent.findMany({
            where: { deletedAt: null }
        });

        return pcs.map(this.toDomain);
    }

    async findByParentProductId(parentProductId: string): Promise<ProductComponent[]> {
        const pcs = await this.prisma.productComponent.findMany({
            where: { parentProductId, deletedAt: null }
        });

        return pcs.map(this.toDomain);
    }

    async findByComponentProductId(componentProductId: string): Promise<ProductComponent[]> {
        const pcs = await this.prisma.productComponent.findMany({
            where: { componentProductId, deletedAt: null }
        });

        return pcs.map(this.toDomain);
    }

    async findByParentAndComponentProductId(parentId: string, componentId: string): Promise<ProductComponent | null> {
        const pc = await this.prisma.productComponent.findFirst({
            where: {
                parentProductId: parentId,
                componentProductId: componentId,
                deletedAt: null
            }
        });

        if (!pc) return null;
        return this.toDomain(pc);
    }

    // find com filtro
    // retorna uma lista de usuarios e pode ser filtrada
    async findMany(filters: { parentId?: string; componentId?: string; }): Promise<ProductComponent[]> {
        console.log("FILTERS:", filters)
        const pc = await this.prisma.productComponent.findMany({
            where: {
                parentProductId: filters.parentId,
                componentProductId: filters.componentId,
            },
        });

        return pc.map(user => this.toDomain(user));
    }

    async exists(parentId: string, componentId: string, ignoreId?: string): Promise<boolean> {
        const count = await this.prisma.productComponent.count({
            where: {
                parentProductId: parentId,
                componentProductId: componentId,
                ...(ignoreId && { id: { not: ignoreId } }),
                deletedAt: null
            }
        });

        return count > 0;
    }

    async create(item: ProductComponent): Promise<void> {
        await this.prisma.productComponent.create({
            data: this.toPrismaCreate(item)
        });
    }

    async save(item: ProductComponent): Promise<void> {
        console.log("ITEM: ", item)
        await this.prisma.productComponent.upsert({
            where: { id: item.id },
            update: this.toPrismaUpdate(item),
            create: this.toPrismaCreate(item),
        });
    }

    // =========================
    // MAPPERS
    // =========================

    private toDomain(prismaPc: PrismaProductComponent): ProductComponent {
        return ProductComponent.restore({
            id: prismaPc.id,
            componentProductId: prismaPc.componentProductId,
            parentProductId: prismaPc.parentProductId,
            quantity: Number(prismaPc.quantity),
            createdAt: prismaPc.createdAt,
            updatedAt: prismaPc.updatedAt,
            deletedAt: prismaPc.deletedAt ?? undefined,
        });
    }

    private toPrismaUpdate(productComponent: ProductComponent): Prisma.ProductComponentUpdateInput {
        return {
            quantity: productComponent.quantity,
            ...(productComponent.parentProductId !== undefined && {
                Product_ProductComponent_parentProductIdToProduct: { connect: { id: productComponent.parentProductId } }
            }),
            ...(productComponent.componentProductId !== undefined && {
                Product_ProductComponent_componentProductIdToProduct: { connect: { id: productComponent.componentProductId } }
            }),
            updatedAt: productComponent.updatedAt,
            deletedAt: productComponent.deletedAt ?? null,
        }
    };

    private toPrismaCreate(productComponent: ProductComponent): Prisma.ProductComponentCreateInput {
        return {
            id: productComponent.id,
            Product_ProductComponent_parentProductIdToProduct: { connect: { id: productComponent.parentProductId } },
            Product_ProductComponent_componentProductIdToProduct: { connect: { id: productComponent.componentProductId } },
            quantity: productComponent.quantity,
        };
    }
}


