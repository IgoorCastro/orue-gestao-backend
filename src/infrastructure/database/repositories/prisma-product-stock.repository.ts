import { PrismaClient, ProductStock as PrismaProductStock, Prisma } from "@/generated/prisma/client";
import { ProductStock } from "@/src/domain/entities/product-stock.entity";
import { Product } from "@/src/domain/entities/product.entity";
import { Stock } from "@/src/domain/entities/stock.entity";
import { Store } from "@/src/domain/entities/store.entity";
import { ProductSize } from "@/src/domain/enums/product-size.enum";
import { ProductType } from "@/src/domain/enums/product-type.enum";
import { StockType } from "@/src/domain/enums/stock-type.enum";
import { ProductStockRepository } from "@/src/domain/repositories/product-stock.repository";

type ProductWithRelations = Prisma.ProductGetPayload<{
    include: {
        ProductColor: { include: { Color: true } },
        ProductMaterial: { include: { Material: true } },
    }
}>;


type StocktWithRelations = Prisma.StockGetPayload<{
    include: {
        Store: true,
    }
}>;

type ProductStockWithProduct = Prisma.ProductStockGetPayload<{
    include: {
        product: {
            include: {
                ProductColor: {
                    include: {
                        Color: true
                    }
                },
                ProductMaterial: {
                    include: {
                        Material: true
                    }
                }
            }
        },
        stock: {
            include: {
                Store: true,
            }
        }
    }
}>;


export class PrismaProductStockRepository implements ProductStockRepository {
    constructor(private readonly prisma: PrismaClient) { }

    async findById(id: string): Promise<ProductStock | null> {
        const productStock = await this.prisma.productStock.findFirst({
            where: { id, deletedAt: null },
        })

        if (!productStock) return null;

        return this.toDomain(productStock);
    }

    async findByProductId(productId: string): Promise<ProductStock[]> {
        const productStocks = await this.prisma.productStock.findMany({
            where: {
                productId,
                deletedAt: null,
            }
        })

        return productStocks.map(this.toDomain);
    }

    async findByStockId(stockId: string): Promise<ProductStock[]> {
        const productStocks = await this.prisma.productStock.findMany({
            where: {
                stockId,
                deletedAt: null
            },
            include: {
                product: true,
            }
        })

        return productStocks.map(this.toDomain);
    }

    async findByProductAndStockId(productId: string, stockId: string): Promise<ProductStock | null> {
        if (!productId || !stockId) return null;

        const productStock = await this.prisma.productStock.findFirst({
            where: {
                productId,
                stockId,
                deletedAt: null,
            }
        });

        if (!productStock) return null;

        return this.toDomain(productStock);
    }

    async findAll(): Promise<ProductStock[]> {
        const productStock = await this.prisma.productStock.findMany({
            where: { deletedAt: null }
        });

        return productStock.map(this.toDomain);
    }

    // find com filtro
    // retorna uma lista de produtos em estoque e pode ser filtrada
    async findMany(filters: { productId?: string; stockId?: string; }): Promise<ProductStock[]> {
        const ps = await this.prisma.productStock.findMany({
            where: {
                productId: filters.productId,
                stockId: filters.stockId,
            },
            include: {
                product: {
                    include: {
                        ProductColor: {
                            include: { Color: true }
                        },
                        ProductMaterial: {
                            include: { Material: true }
                        }
                    }
                },
                stock: {
                    include: {
                        Store: true,
                    }
                }
            }
        });

        return ps.map((productStock, index) => {
            try {
                return this.toDomainWithInclude(productStock);
            } catch (e) {
                console.error(`❌ Erro no mapeamento do ProductStock índice [${index}]:`, e);
                throw e;
            }
        });
    }

    async exists(productId: string, stockId: string, ignoreId?: string): Promise<boolean> {
        const exist = await this.prisma.productStock.findFirst({
            where: {
                productId,
                stockId,
                ...(ignoreId ? { id: { not: ignoreId } } : {}), // ignora um id específico 
                deletedAt: null
            }
        })

        return !!exist;
    }

    async save(item: ProductStock): Promise<void> {
        console.log("\n\nPRISMA >> ProductStock - Item: ", item)
        await this.prisma.productStock.upsert({
            where: { id: item.id },
            update: this.toPrismaUpdate(item),
            create: this.toPrismaCreate(item),
        });
    }

    // =========================
    // MAPPERS
    // =========================

    private toDomain(prismaProductStock: PrismaProductStock): ProductStock {
        return ProductStock.restore({
            id: prismaProductStock.id,
            productId: prismaProductStock.productId,
            stockId: prismaProductStock.stockId,
            quantity: prismaProductStock.quantity,
            createdAt: prismaProductStock.createdAt,
            updatedAt: prismaProductStock.updatedAt,
            deletedAt: prismaProductStock.deletedAt ?? undefined,
        });
    }

    private toDomainWithInclude(prismaProductStock: ProductStockWithProduct): ProductStock {
        return ProductStock.restore({
            id: prismaProductStock.id,
            productId: prismaProductStock.productId,
            stockId: prismaProductStock.stockId,
            quantity: prismaProductStock.quantity,
            createdAt: prismaProductStock.createdAt,
            updatedAt: prismaProductStock.updatedAt,
            deletedAt: prismaProductStock.deletedAt ?? undefined,

            product: prismaProductStock.product
                ? this.mapProduct(prismaProductStock.product)
                : undefined,

            stock: prismaProductStock.stock
                ? this.mapStock(prismaProductStock.stock)
                : undefined,
        });
    }

    private toPrismaUpdate(productStock: ProductStock): Prisma.ProductStockUpdateInput {
        return {
            quantity: productStock.quantity,
            updatedAt: productStock.updatedAt,
            deletedAt: productStock.deletedAt ?? null,
        };
    }

    private toPrismaCreate(productStock: ProductStock): Prisma.ProductStockCreateInput {
        return {
            id: productStock.id,
            quantity: productStock.quantity,
            product: { connect: { id: productStock.productId } },
            stock: { connect: { id: productStock.stockId } },
        };
    }

    private mapProduct(prismaProduct: ProductWithRelations): Product {
        return Product.restore({
            id: prismaProduct.id,
            name: prismaProduct.name,
            sku: prismaProduct.sku,
            normalizedName: prismaProduct.normalizedName,
            price: prismaProduct.price,
            modelId: prismaProduct.modelId,

            type: this.mapProductType(prismaProduct.type),
            size: this.mapProductSize(prismaProduct.size),

            barcode: prismaProduct.barcode ?? undefined,
            mlProductId: prismaProduct.mlProductId ?? undefined,

            createdAt: prismaProduct.createdAt,
            updatedAt: prismaProduct.updatedAt,
            deletedAt: prismaProduct.deletedAt ?? undefined,

            colors: prismaProduct.ProductColor.map(pc => pc.Color.name),
            materials: prismaProduct.ProductMaterial.map(pm => pm.Material.name),
        });
    }

    private mapStock(prismaProduct: StocktWithRelations): Stock {
        // Aqui você cria a instância
        const storeInstance = prismaProduct.Store
            ? Store.restore({
                id: prismaProduct.Store.id,
                name: prismaProduct.Store.name,
                createdAt: prismaProduct.Store.createdAt,
                updatedAt: prismaProduct.Store.updatedAt,
                deletedAt: prismaProduct.Store.deletedAt ?? undefined,
            })
            : undefined;

        return Stock.restore({
            id: prismaProduct.id,
            name: prismaProduct.name,
            type: this.mapStockType(prismaProduct.type),
            storeId: prismaProduct.storeId ?? undefined,
            createdAt: prismaProduct.createdAt,
            updatedAt: prismaProduct.updatedAt,
            deletedAt: prismaProduct.deletedAt ?? undefined,
            // Se o Stock.restore guarda a INSTÂNCIA, o problema persistirá na saída da API
            store: storeInstance,
        });
    }



    private mapProductType(type: string): ProductType {
        switch (type) {
            case "PRODUCT":
                return ProductType.PRODUCT;
            case "KIT":
                return ProductType.KIT;
            case "PACKAGE":
                return ProductType.PACKAGE;
            default:
                throw new Error(`Invalid ProductType: ${type}`);
        }
    }

    private mapStockType(type: string): StockType {
        switch (type) {
            case "MAIN":
                return StockType.MAIN;
            case "STORE":
                return StockType.STORE;
            default:
                throw new Error(`Invalid StockType: ${type}`);
        }
    }



    private mapProductSize(size: string | null): ProductSize | undefined {
        if (!size) return undefined;
        switch (size) {
            case "P":
                return ProductSize.P;
            case "M":
                return ProductSize.M;
            case "G":
                return ProductSize.G;
            case "GG":
                return ProductSize.GG;
            case "XG":
                return ProductSize.XG;
            default:
                console.warn(`Tamanho desconhecido encontrado: ${size}`);
                return undefined;
        }
    }
}

