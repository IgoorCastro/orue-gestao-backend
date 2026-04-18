import { PrismaClient, Prisma, ProductType as PrismaProductType } from "@/generated/prisma/client";
import { Color } from "@/src/domain/entities/color.entity";
import { Material } from "@/src/domain/entities/material.entity";
import { ProductColor } from "@/src/domain/entities/product-color";
import { ProductMaterial } from "@/src/domain/entities/product-material";
import { Product } from "@/src/domain/entities/product.entity";
import { ProductSize } from "@/src/domain/enums/product-size.enum";
import { ProductType } from "@/src/domain/enums/product-type.enum";
import { ProductRepository } from "@/src/domain/repositories/product.repository";
import { ProductFilters } from "@/src/domain/types/product-filters.type";

type PrismaProductWithRelations = Prisma.ProductGetPayload<{
    include: {
        ProductColor: {
            include: {
                Color: true;
            };
        };
        ProductMaterial: {
            include: {
                Material: true;
            };
        };
    };
}>;

export class PrismaProductRepository implements ProductRepository {
    constructor(private readonly prisma: PrismaClient) { }

    // =========================
    // FIND
    // =========================

    async findById(id: string): Promise<Product | null> {
        const product = await this.prisma.product.findFirst({
            where: { id },
            include: this.defaultInclude
        });

        if (!product) return null;

        return this.toDomain(product);
    }

    async findByName(name: string): Promise<Product[]> {
        const products = await this.prisma.product.findMany({
            where: {
                name: {
                    equals: name,
                    mode: "insensitive"
                },
            },
            include: this.defaultInclude
        });

        return products.map(p => this.toDomain(p));
    }

    async findBySku(sku: string): Promise<Product | null> {
        const product = await this.prisma.product.findUnique({
            where: { sku, deletedAt: null },
            include: this.defaultInclude
        });

        return product ? this.toDomain(product) : null;
    }

    async findByBarcode(barcode: string): Promise<Product | null> {
        const product = await this.prisma.product.findUnique({
            where: { barcode, deletedAt: null, },
            include: this.defaultInclude
        });

        return product ? this.toDomain(product) : null;
    }

    async findAll(): Promise<Product[]> {
        const products = await this.prisma.product.findMany({
            where: { deletedAt: null },
            include: this.defaultInclude
        });

        return products.map(p => this.toDomain(p));
    }

    // =========================
    // FILTERS
    // =========================

    async findWithFilters(filters: ProductFilters) {
        console.log("\n\nINFRA >> PRISMA >> \nFILTERS: ", filters)
        const where: Prisma.ProductWhereInput = {
            name: filters.name
                ? { contains: filters.name, mode: "insensitive" }
                : undefined,

            size: filters.size,

            price: filters.maxPrice || filters.minPrice
                ? {
                    ...(filters.minPrice !== undefined && { gte: Number(filters.minPrice) }),
                    ...(filters.maxPrice !== undefined && { lte: Number(filters.maxPrice) }),
                }
                : undefined,

            modelId: filters.modelIds?.length
                ? { in: filters.modelIds }
                : undefined,

            type: filters.type as PrismaProductType,

            barcode: filters.barcode,

            mlProductId: filters.mlProductId,

            AND: [
                ...(filters.colorIds?.map((colorId) => ({
                    ProductColor: {
                        some: { colorId }
                    }
                })) ?? []),
                ...(filters.materialIds?.map((materialId) => ({
                    ProductMaterial: {
                        some: { materialId }
                    }
                })) ?? []),
            ],
        };

        const limit = filters.limit ?? 10;
        const page = filters.page && filters.page > 0 ? filters.page : 1;
        const orderBy = filters.orderBy
            ? { [filters.orderBy.field]: filters.orderBy.direction }
            : undefined;

        const [data, total] = await Promise.all([
            this.prisma.product.findMany({
                where,
                include: this.defaultInclude,
                take: limit,
                skip: (page - 1) * limit,
                orderBy: orderBy ?? { createdAt: "desc" },
            }),
            this.prisma.product.count({ where })
        ]);

        // console.log(data.map((d) => d.ProductMaterial.map(m => m)));

        return {
            data: data.map(p => this.toDomain(p)),
            total
        };
    }

    // =========================
    // EXISTS
    // =========================

    async existsById(id: string): Promise<boolean> {
        const exists = await this.prisma.product.findUnique({ where: { id } });
        return !!exists;
    }

    async existsByName(name: string): Promise<boolean> {
        const exists = await this.prisma.product.findFirst({
            where: {
                name: { equals: name, mode: "insensitive" },
            },
            select: { id: true },
        });
        return !!exists;
    }

    async existsByBarcode(barcode: string): Promise<boolean> {
        const exists = await this.prisma.product.findFirst({
            where: {
                barcode: { equals: barcode, mode: "insensitive" },
            },
            select: { id: true },
        });
        return !!exists;
    }

    // =========================
    // SAVE
    // =========================

    // Apenas campos do produto
    async updateFields(product: Product): Promise<void> {
        await this.prisma.product.update({
            where: { id: product.id },
            data: this.toPrismaUpdate(product),
        });
    }

    // Atualiza produto + relações (cores e materiais)
    async save(product: Product): Promise<void> {
    try {
        console.log("\n\nINFRA >> PRISMA >> INICIANDO SALVAMENTO: ", product.id);

        await this.prisma.$transaction(async (prisma) => {
            // 1. Atualiza o produto principal
            await prisma.product.update({
                where: { id: product.id },
                data: {
                    name: product.name,
                    type: product.type as PrismaProductType,
                    price: product.price,
                    size: product.size,
                    sku: product.sku,
                    barcode: product.barcode,
                    // Se modelId for null/undefined, o connect pode quebrar. 
                    // Usando ternário para segurança:
                    model: product.modelId ? { connect: { id: product.modelId } } : undefined,
                    deletedAt: product.deletedAt ?? null,
                    updatedAt: product.updatedAt,
                },
            });

            // 2. Atualiza cores (Delete + Create)
            await prisma.productColor.deleteMany({ where: { productId: product.id } });
            
            if (product.colors && product.colors.length > 0) {
                await prisma.productColor.createMany({
                    data: product.colors.map(colorId => ({
                        id: crypto.randomUUID(),
                        productId: product.id,
                        colorId,
                    })),
                });
            }

            // 3. Atualiza materiais (Delete + Create)
            await prisma.productMaterial.deleteMany({ where: { productId: product.id } });
            
            if (product.materials && product.materials.length > 0) {
                await prisma.productMaterial.createMany({
                    data: product.materials.map(materialId => ({
                        id: crypto.randomUUID(),
                        productId: product.id,
                        materialId,
                    })),
                });
            }
        });

        console.log("INFRA >> PRISMA >> SUCESSO");

    } catch (error: any) {
        // Log detalhado para matar o erro 500
        console.error("\n\n--- [ERRO PRISMA SAVE] ---");
        console.error("Mensagem:", error.message);
        console.error("Código Prisma:", error.code); // Ex: P2002, P2025
        console.error("Meta:", error.meta);
        console.error("Stack:", error.stack);
        console.error("---------------------------\n");

        // Lança o erro para a camada superior (Service/Controller) tratar
        throw new Error(`Falha ao salvar produto: ${error.message}`);
    }
}

    async create(product: Product): Promise<void> {
        try {
            await this.prisma.$transaction(async (prisma) => {
                // cria produto
                await prisma.product.create({
                    data: this.toPrismaCreate(product),
                });

                // cores
                if (product.colors.length) {
                    await prisma.productColor.createMany({
                        data: product.colors.map(colorId => ({
                            id: crypto.randomUUID(),
                            productId: product.id,
                            colorId,
                        })),
                    });
                }

                // materiais
                if (product.materials.length) {
                    await prisma.productMaterial.createMany({
                        data: product.materials.map(materialId => ({
                            id: crypto.randomUUID(),
                            productId: product.id,
                            materialId,
                        })),
                    });
                }
            });
        } catch (error: unknown) {
            console.error("PRISMA ERROR:", error);
            throw error;
        }

    }

    // =========================
    // MAPPERS
    // =========================

    private toDomain(prismaProduct: PrismaProductWithRelations): Product {
        return Product.restore({
            id: prismaProduct.id,
            name: prismaProduct.name,
            normalizedName: prismaProduct.normalizedName,
            type: prismaProduct.type as ProductType,
            price: prismaProduct.price,
            size: prismaProduct.size as ProductSize ?? undefined,
            modelId: prismaProduct.modelId ?? undefined,
            colors: prismaProduct.ProductColor.map(c => c.colorId),
            materials: prismaProduct.ProductMaterial.map(m => m.materialId),
            productColor: prismaProduct.ProductColor?.map(pc =>
                new ProductColor({
                    id: pc.id,
                    productId: pc.productId,
                    colorId: pc.colorId,
                    // Criando a instância da classe Color primeiro
                    color: Color.create({
                        id: pc.Color.id,
                        name: pc.Color.name,
                    }),
                })
            ) ?? undefined,
            productMaterial: prismaProduct.ProductMaterial?.map(pm =>
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
            sku: prismaProduct.sku,
            barcode: prismaProduct.barcode ?? undefined,
            mlProductId: prismaProduct.mlProductId ?? undefined,
            createdAt: prismaProduct.createdAt,
            updatedAt: prismaProduct.updatedAt,
            deletedAt: prismaProduct.deletedAt ?? undefined,
        });
    }

    private toPrismaUpdate(product: Product): Prisma.ProductUpdateInput {
        return {
            name: product.name,
            normalizedName: product.normalizedName,
            type: product.type as PrismaProductType,
            price: product.price,
            size: product.size,
            model: { connect: { id: product.modelId } },
            sku: product.sku,
            barcode: product.barcode,
            updatedAt: product.updatedAt,
            deletedAt: product.deletedAt ?? null,
        };
    }

    private toPrismaCreate(product: Product): Prisma.ProductCreateInput {
        console.log("PRISMA CREATE >> product", product)
        return {
            id: product.id,
            name: product.name,
            normalizedName: product.normalizedName,
            mlProductId: product.mlProductId,
            type: product.type as PrismaProductType,
            price: product.price,
            size: product.size,
            model: product.modelId
                ? { connect: { id: product.modelId } }
                : undefined,
            sku: product.sku,
            barcode: product.barcode,
        };
    }

    // =========================
    // DEFAULT INCLUDE
    // =========================

    private readonly defaultInclude = {
        ProductColor: {
            include: {
                Color: true,
            },
        },
        ProductMaterial: {
            include: {
                Material: true,
            },
        },
    } satisfies Prisma.ProductInclude;
}