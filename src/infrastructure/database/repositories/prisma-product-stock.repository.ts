import { PrismaClient, ProductStock as PrismaProductStock, Prisma } from "@/generated/prisma/client";
import { ProductStock } from "@/src/domain/entities/product-stock.entity";
import { StockType } from "@/src/domain/enums/stock-type.enum";
import { ProductStockRepository } from "@/src/domain/repositories/product-stock.repository";
import { StockRepository } from "@/src/domain/repositories/stock.repository";

export class PrismaProductStockRepository implements ProductStockRepository {
    constructor(private readonly prisma: PrismaClient) { }

    async findById(id: string): Promise<ProductStock | null> {
        const productStock = await this.prisma.productStock.findFirst({
            where: { id, deletedAt: null },
        })
        
        if(!productStock) return null;

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
            }
        })

        return productStocks.map(this.toDomain);  
    }

    async findByProductAndStockId(productId: string, stockId: string): Promise<ProductStock | null> {
        if (!productId || !stockId) return null;

        const productStock = await this.prisma.productStock.findUnique({
            where: {
                productId_stockId: { // nome gerado automaticamente pelo Prisma para a @@unique
                    productId,
                    stockId
                },
                deletedAt: null,
            }
        });

        if(!productStock) return null;

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
        console.log("FILTERS:", filters)
        const ps = await this.prisma.productStock.findMany({
            where: {
                productId: filters.productId,
                stockId: filters.stockId,
            },
        });

        return ps.map(user => this.toDomain(user));
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
        await this.prisma.productStock.upsert({
            where: { id: item.id },
            update: this.toPrismaUpdate(item),
            create: this.toPrismaCreate(item),
        });
    }

    // =========================
    // 🔁 MAPPERS
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
}

