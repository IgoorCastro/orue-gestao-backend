// repositorio da composição de produtos
// pc = product component

import { Prisma, PrismaClient } from "@/generated/prisma/client";
import { Color } from "@/src/domain/entities/color.entity";
import { Material } from "@/src/domain/entities/material.entity";
import { ProductColor } from "@/src/domain/entities/product-color";
import { ProductComponent } from "@/src/domain/entities/product-component";
import { ProductMaterial } from "@/src/domain/entities/product-material";
import { Product } from "@/src/domain/entities/product.entity";
import { ProductSize } from "@/src/domain/enums/product-size.enum";
import { ProductType } from "@/src/domain/enums/product-type.enum";
import { ProductComponentRepository } from "@/src/domain/repositories/product-component.repository";

type PrismaProductComponentWithRelations = Prisma.ProductComponentGetPayload<{
    include: {
        Product_ProductComponent_componentProductIdToProduct: {
            include: {
                ProductColor: {
                    include: {
                        Color: true,
                    }
                },
                ProductMaterial: {
                    include: {
                        Material: true,
                    }
                },
            }
        },
        Product_ProductComponent_parentProductIdToProduct: {
            include: {
                ProductColor: {
                    include: {
                        Color: true,
                    }
                },
                ProductMaterial: {
                    include: {
                        Material: true,
                    }
                },
            }
        },
    };
}>;

export class PrismaProductComponentRepository implements ProductComponentRepository {
    constructor(private readonly prisma: PrismaClient) { }

    async findById(id: string): Promise<ProductComponent | null> {
        const pc = await this.prisma.productComponent.findUnique({
            where: { id },
            include: this.defaultInclude,

        })

        if (!pc) return null;

        return this.toDomain(pc);
    }

    async findAll(): Promise<ProductComponent[]> {
        const pcs = await this.prisma.productComponent.findMany({
            where: { deletedAt: null },
            include: this.defaultInclude,
        });

        return pcs.map(this.toDomain);
    }

    async findByParentProductId(parentProductId: string): Promise<ProductComponent[]> {
        const pcs = await this.prisma.productComponent.findMany({
            where: { parentProductId, deletedAt: null },
            include: this.defaultInclude,
        });

        return pcs.map(this.toDomain);
    }

    async findByComponentProductId(componentProductId: string): Promise<ProductComponent[]> {
        const pcs = await this.prisma.productComponent.findMany({
            where: { componentProductId, deletedAt: null },
            include: this.defaultInclude,
        });

        return pcs.map(this.toDomain);
    }

    async findByParentAndComponentProductId(parentId: string, componentId: string): Promise<ProductComponent | null> {
        const pc = await this.prisma.productComponent.findFirst({
            where: {
                parentProductId: parentId,
                componentProductId: componentId,
                deletedAt: null
            },
            include: this.defaultInclude,
        });

        if (!pc) return null;
        return this.toDomain(pc);
    }

    // find com filtro
    // retorna uma lista de usuarios e pode ser filtrada
    async findMany(filters: { parentId?: string; componentId?: string; }): Promise<ProductComponent[]> {
        const pc = await this.prisma.productComponent.findMany({
            where: {
                parentProductId: filters.parentId,
                componentProductId: filters.componentId,
            },
            include: this.defaultInclude,
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
        await this.prisma.productComponent.upsert({
            where: { id: item.id },
            update: this.toPrismaUpdate(item),
            create: this.toPrismaCreate(item),
        });
    }

    // =========================
    // MAPPERS
    // =========================

    private toDomain(prismaPc: PrismaProductComponentWithRelations): ProductComponent {
        return ProductComponent.restore({
            id: prismaPc.id,
            componentProductId: prismaPc.componentProductId,
            parentProductId: prismaPc.parentProductId,
            quantity: Number(prismaPc.quantity),
            componentProduct: Product.restore({
                id: prismaPc.Product_ProductComponent_componentProductIdToProduct.id,
                name: prismaPc.Product_ProductComponent_componentProductIdToProduct.name,
                price: prismaPc.Product_ProductComponent_componentProductIdToProduct.price,
                normalizedName: prismaPc.Product_ProductComponent_componentProductIdToProduct.normalizedName,
                type: prismaPc.Product_ProductComponent_componentProductIdToProduct.type as ProductType,
                size: prismaPc.Product_ProductComponent_componentProductIdToProduct.size as ProductSize,
                sku: prismaPc.Product_ProductComponent_componentProductIdToProduct.sku,
                modelId: prismaPc.Product_ProductComponent_componentProductIdToProduct.modelId ?? undefined,
                barcode: prismaPc.Product_ProductComponent_componentProductIdToProduct.barcode ?? undefined,
                createdAt: prismaPc.Product_ProductComponent_componentProductIdToProduct.createdAt,
                updatedAt: prismaPc.Product_ProductComponent_componentProductIdToProduct.updatedAt,
                deletedAt: prismaPc.Product_ProductComponent_componentProductIdToProduct.deletedAt ?? undefined,
                mlProductId: prismaPc.Product_ProductComponent_componentProductIdToProduct.mlProductId ?? undefined,
                colors: prismaPc.Product_ProductComponent_componentProductIdToProduct.ProductColor.map(pc => pc.colorId),
                materials: prismaPc.Product_ProductComponent_componentProductIdToProduct.ProductMaterial.map(pm => pm.materialId),
                productColor: prismaPc.Product_ProductComponent_componentProductIdToProduct.ProductColor?.map(pc =>
                    new ProductColor({
                        id: pc.id,
                        productId: pc.productId,
                        colorId: pc.colorId,
                        // Criando a instância da classe Color primeiro
                        color: Color.restore({
                            id: pc.Color.id,
                            name: pc.Color.name,
                            normalizedName: pc.Color.normalizedName,
                            createdAt: pc.Color.createdAt,
                            updatedAt: pc.Color.updatedAt,
                            deletedAt: pc.Color.deletedAt ?? undefined,
                        }),
                    })
                ) ?? undefined,

                productMaterial: prismaPc.Product_ProductComponent_componentProductIdToProduct.ProductMaterial?.map(pm =>
                    new ProductMaterial({
                        id: pm.id,
                        materialId: pm.materialId,
                        productId: pm.productId,
                        material: Material.create({
                            id: pm.Material.id,
                            name: pm.Material.name,
                        })
                    })
                ),
            }),

            parentProduct: Product.restore({
                id: prismaPc.Product_ProductComponent_parentProductIdToProduct.id,
                name: prismaPc.Product_ProductComponent_parentProductIdToProduct.name,
                price: prismaPc.Product_ProductComponent_parentProductIdToProduct.price,
                normalizedName: prismaPc.Product_ProductComponent_parentProductIdToProduct.normalizedName,
                type: prismaPc.Product_ProductComponent_parentProductIdToProduct.type as ProductType,
                size: prismaPc.Product_ProductComponent_parentProductIdToProduct.size as ProductSize,
                sku: prismaPc.Product_ProductComponent_parentProductIdToProduct.sku,
                modelId: prismaPc.Product_ProductComponent_parentProductIdToProduct.modelId ?? undefined,
                barcode: prismaPc.Product_ProductComponent_parentProductIdToProduct.barcode ?? undefined,
                createdAt: prismaPc.Product_ProductComponent_parentProductIdToProduct.createdAt,
                updatedAt: prismaPc.Product_ProductComponent_parentProductIdToProduct.updatedAt,
                deletedAt: prismaPc.Product_ProductComponent_parentProductIdToProduct.deletedAt ?? undefined,
                mlProductId: prismaPc.Product_ProductComponent_parentProductIdToProduct.mlProductId ?? undefined,
                colors: prismaPc.Product_ProductComponent_parentProductIdToProduct.ProductColor.map(pc => pc.colorId),
                materials: prismaPc.Product_ProductComponent_parentProductIdToProduct.ProductMaterial.map(pm => pm.materialId),
                productColor: prismaPc.Product_ProductComponent_parentProductIdToProduct.ProductColor?.map(pc =>
                    new ProductColor({
                        id: pc.id,
                        productId: pc.productId,
                        colorId: pc.colorId,
                        // Criando a instância da classe Color primeiro
                        color: Color.restore({
                            id: pc.Color.id,
                            name: pc.Color.name,
                            normalizedName: pc.Color.normalizedName,
                            createdAt: pc.Color.createdAt,
                            updatedAt: pc.Color.updatedAt,
                            deletedAt: pc.Color.deletedAt ?? undefined,
                        }),
                    })
                ) ?? undefined,

                productMaterial: prismaPc.Product_ProductComponent_parentProductIdToProduct.ProductMaterial?.map(pm =>
                    new ProductMaterial({
                        id: pm.id,
                        materialId: pm.materialId,
                        productId: pm.productId,
                        material: Material.create({
                            id: pm.Material.id,
                            name: pm.Material.name,
                        })
                    })
                ),
            }),
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

    // =========================
    // DEFAULT INCLUDE
    // =========================

    private readonly defaultInclude = {
        Product_ProductComponent_componentProductIdToProduct: {
            include: {
                ProductColor: {
                    include: {
                        Color: true,
                    }
                },
                ProductMaterial: {
                    include: {
                        Material: true,
                    }
                },
            }
        },
        Product_ProductComponent_parentProductIdToProduct: {
            include: {
                ProductColor: {
                    include: {
                        Color: true,
                    }
                },
                ProductMaterial: {
                    include: {
                        Material: true,
                    }
                },
            }
        },
    } satisfies Prisma.ProductComponentInclude;
}


