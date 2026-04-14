import { PrismaClient, StockType as PrismaStockType, Stock as PrismaStock, Prisma } from "@/generated/prisma/client";
import { Stock } from "@/src/domain/entities/stock.entity";
import { Store } from "@/src/domain/entities/store.entity";
import { StockType } from "@/src/domain/enums/stock-type.enum";
import { StockRepository } from "@/src/domain/repositories/stock.repository";
import normalizeName from "@/src/domain/utils/normalize-name";

type StockWithRelations = Prisma.StockGetPayload<{
    include: {
        Store: true,
    }
}>;

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
        const stocks = await this.prisma.stock.findMany({
            where: {
                name: { contains: name, mode: "insensitive" },
                deletedAt: null,
            }
        })

        return stocks.map(stock => this.toDomain(stock));
    }

    async findByStoreId(storeId: string): Promise<Stock[]> {
        const stocks = await this.prisma.stock.findMany({
            where: { storeId, deletedAt: null }
        });

        return stocks.map(stock => this.toDomain(stock));
    }

    async findByType(type: StockType): Promise<Stock[]> {
        const stocks = await this.prisma.stock.findMany({
            where: { type: type as PrismaStockType, deletedAt: null }
        });

        return stocks.map(stock => this.toDomain(stock));
    }

    async findAll(): Promise<Stock[]> {
        const stocks = await this.prisma.stock.findMany({
            where: { deletedAt: null }
        });

        return stocks.map(stock => this.toDomain(stock));
    }

    async findMany(filters: { name?: string; storeId?: string; type?: StockType; }): Promise<Stock[]> {
        const stocks = await this.prisma.stock.findMany({
            where: {
                name: filters.name
                    ? normalizeName(filters.name)
                    : undefined,
                type: filters.type ?? undefined,
                storeId: filters.storeId,
            },
            include: {
                Store: true,
            }
        })

        return stocks.map(st => this.toDomainWithRelations(st));
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

    private toDomain(prismaStock: PrismaStock): Stock {// Verificamos se a propriedade Store existe no objeto vindo do Prisma
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

    private toDomainWithRelations(prismaStock: StockWithRelations): Stock {// Verificamos se a propriedade Store existe no objeto vindo do Prisma
        return Stock.restore({
            id: prismaStock.id,
            name: prismaStock.name,
            type: this.mapTypeToDomain(prismaStock.type),
            storeId: prismaStock.storeId ?? undefined,
            createdAt: prismaStock.createdAt,
            updatedAt: prismaStock.updatedAt,
            deletedAt: prismaStock.deletedAt ?? undefined,

            // Mapeamento seguro da Store
            store: prismaStock.Store
                ? Store.restore({
                    id: prismaStock.Store.id,
                    name: prismaStock.Store.name,
                    createdAt: prismaStock.Store.createdAt,
                    updatedAt: prismaStock.Store.updatedAt,
                    deletedAt: prismaStock.Store.deletedAt ?? undefined,
                })
                : undefined,
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

