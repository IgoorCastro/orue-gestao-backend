import { PrismaClient, StockType as PrismaStockType, Stock as PrismaStock, Prisma } from "@/generated/prisma/client";
import { Stock } from "@/src/domain/entities/stock.entity";
import { StockType } from "@/src/domain/enums/stock-type.enum";
import { StockRepository } from "@/src/domain/repositories/stock.repository";
import normalizeName from "@/src/domain/utils/normalize-name";

export class PrismaStockRepository implements StockRepository {
    constructor(private readonly prisma: PrismaClient) { }

    async findById(id: string): Promise<Stock | null> {
        const stock = await this.prisma.stock.findUnique({
            where: { id },
        })

        if (!stock) return null;
        return this.toDomain(stock);
    }

    async findByName(name: string): Promise<Stock[]> {
        const stock = await this.prisma.stock.findMany({
            where: { name: { contains: name, mode: "insensitive" } }
        })

        return stock.map(this.toDomain);
    }

    async findByStoreId(storeId: string): Promise<Stock[]> {
        const stock = await this.prisma.stock.findMany({
            where: { storeId, deletedAt: null }
        });

        return stock.map(this.toDomain);
    }

    async findByType(type: StockType): Promise<Stock[]> {
        const stock = await this.prisma.stock.findMany({
            where: { type: type as PrismaStockType, deletedAt: null }
        });

        return stock.map(this.toDomain);
    }

    async findAll(): Promise<Stock[]> {
        const stock = await this.prisma.stock.findMany({
            where: { deletedAt: null }
        });

        return stock.map(this.toDomain);
    }

    async findMany(filters: { name?: string; storeId?: string; type?: StockType; }): Promise<Stock[]> {
        const stocks = await this.prisma.stock.findMany({
            where: {
                name: filters.name
                    ? normalizeName(filters.name)
                    : undefined,
                type: filters.type ?? undefined,
                storeId: filters.storeId,
            }
        })

        return stocks.map(st => this.toDomain(st));
    }

    async save(stock: Stock): Promise<void> {
        await this.prisma.stock.upsert({
            where: { id: stock.id },
            update: this.toPrismaUpdate(stock),
            create: this.toPrismaCreate(stock),
        });
    }

    // =========================
    // MAPPERS
    // =========================

    private toDomain(prismaStock: PrismaStock): Stock {
        return Stock.restore({
            id: prismaStock.id,
            name: prismaStock.name,
            type: this.mapTypeToDomain(prismaStock.type),
            storeId: prismaStock.storeId ?? undefined,
            createdAt: prismaStock.createdAt,
            updatedAt: prismaStock.updatedAt,
            deletedAt: prismaStock.deletedAt ?? undefined,
        });
    }

    private toPrismaUpdate(stock: Stock): Prisma.StockUpdateInput {
        return {
            name: stock.name,
            type: stock.type as PrismaStockType,
            updatedAt: new Date(),
            deletedAt: stock.deletedAt ?? null,
            ...(stock.storeId !== undefined && {
                Store: stock.storeId
                    ? { connect: { id: stock.storeId } }
                    : { disconnect: true }
            })
        };
    }

    private toPrismaCreate(stock: Stock): Prisma.StockCreateInput {
        return {
            id: stock.id,
            name: stock.name,
            type: stock.type as PrismaStockType,
            Store: stock.storeId
                ? { connect: { id: stock.storeId } }
                : undefined
        };
    }

    // converte type do prisma para o enum do sistema
    private mapTypeToDomain(type: PrismaStockType): StockType {
        return type as StockType;
    }
}

