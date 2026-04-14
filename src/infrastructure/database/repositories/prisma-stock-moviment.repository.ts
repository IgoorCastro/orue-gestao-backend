import {
    PrismaClient, StockMovimentType as PrismaStockMovimentType, StockMoviment as PrismaStockMoviment, Prisma, StockType as PrismaStockType
} from "@/generated/prisma/client";
import { ProductStock } from "@/src/domain/entities/product-stock.entity";
import { Product } from "@/src/domain/entities/product.entity";
import { StockMoviment } from "@/src/domain/entities/stock-moviment.entity";
import { Stock } from "@/src/domain/entities/stock.entity";
import { Store } from "@/src/domain/entities/store.entity";
import { User } from "@/src/domain/entities/user.entity";
import { ProductSize } from "@/src/domain/enums/product-size.enum";
import { ProductType } from "@/src/domain/enums/product-type.enum";
import { StockMovimentType } from "@/src/domain/enums/stock-moviment-type.enum";
import { StockType } from "@/src/domain/enums/stock-type.enum";
import { UserRole } from "@/src/domain/enums/user-role.enum";
import { StockMovimentRepository } from "@/src/domain/repositories/stock-moviment.repository";
import { StockMovimentFilters } from "@/src/domain/types/stock-moviment-filters.type";
import { Password } from "@/src/domain/value-objects/password.vo";

type StockMovimentWithRelations = Prisma.StockMovimentGetPayload<{
    include: {
        ProductStock: {
            include: {
                product: {
                    include: {
                        ProductColor: true,
                        ProductMaterial: true,
                    }
                },
                stock: {
                    include: {
                        Store: true,
                    }
                }
            }
        },
        User: true,
        Stock_StockMoviment_fromStockIdToStock: {
            include: { Store: true }
        },
        Stock_StockMoviment_toStockidToStock: {
            include: { Store: true }
        }
    }
}>;

export class PrismaStockMovimentRepository implements StockMovimentRepository {
    constructor(private readonly prisma: PrismaClient) { }

    async findById(id: string): Promise<StockMoviment | null> {
        const sm = await this.prisma.stockMoviment.findUnique({
            where: { id },
            include: this.defaultInclude,
        })

        if (!sm) return null;

        return this.toDomain(sm);
    }

    async findMany(): Promise<StockMoviment[]> {
        const sms = await this.prisma.stockMoviment.findMany({
            include: this.defaultInclude,
        });

        return sms.map(sm => this.toDomain(sm));
    }

    async findWithFilters(filters: StockMovimentFilters): Promise<{ data: StockMoviment[]; total: number; }> {
        console.log("PRISMA >> STOCK MOVIMENT >> filters: ", filters)
        const where: Prisma.StockMovimentWhereInput = {
            ...(filters.type && { type: filters.type as PrismaStockMovimentType }),
            ...(filters.quantity && { quantity: filters.quantity }),
            ...(filters.fromStockId && { fromStockId: filters.fromStockId }),
            ...(filters.toStockId && { toStockid: filters.toStockId }),
            ...(filters.productStockId && { productStockId: filters.productStockId }),
            ...(filters.userId && { userId: filters.userId }),

            totalPrice: filters.price
                ? {
                    ...(filters.price.gte !== undefined && { gte: filters.price.gte }),
                    ...(filters.price.lte !== undefined && { lte: filters.price.lte }),
                }
                : undefined,

            createdAt: filters.createdAt
                ? {
                    ...(filters.createdAt.gte !== undefined && { gte: new Date(filters.createdAt.gte.setHours(0, 0, 0, 0)) }),
                    ...(filters.createdAt.lte !== undefined && { lte: new Date(filters.createdAt.lte.setHours(23, 59, 59, 999)) }),
                }
                : undefined,
        };

        // configuração da paginação
        const limit = filters.limit ?? 10;
        const page = filters.page && filters.page > 0 ? filters.page : 1;
        const orderBy = filters.orderBy
            ? { [filters.orderBy.field]: filters.orderBy.direction }
            : undefined;

        const [data, total] = await Promise.all([
            this.prisma.stockMoviment.findMany({
                where,
                include: this.defaultInclude,
                take: 14,
                skip: (page - 1) * limit,
                orderBy: orderBy,
            }),
            this.prisma.stockMoviment.count({ where })
        ]);

        // console.log("PRISMA >>> ", data.map(d => d.Stock_StockMoviment_toStockidToStock))
        // console.log("PRISMA >>> ", data.map(d => d.Stock_StockMoviment_fromStockIdToStock))
        // console.log("PRISMA >>> ", data.map(d => d))

        return {
            data: data.map(sm => this.toDomainWithRelations(sm)),
            total
        };
    }

    async save(stockMoviment: StockMoviment): Promise<void> {
        // console.log("PRSMA SM >> item: ", stockMoviment)
        try {
            await this.prisma.stockMoviment.create({
                data: this.toPrismaCreate(stockMoviment),
            });
        } catch (error: unknown) {
            if (error instanceof Prisma.PrismaClientKnownRequestError) {
                // P2025 é o código para "Record to connect not found"
                if (error.code === 'P2025') {
                    console.error("Erro de Relação: O ProductStock ainda não está disponível no banco.");
                    throw new Error("Não foi possível vincular a movimentação: Estoque do produto não encontrado.");
                }
            }

            console.error("Erro inesperado no Prisma:", error);
            throw error;
        }
    }


    // =========================
    // MAPPERS
    // =========================

    private toDomain(prismaSM: PrismaStockMoviment): StockMoviment {
        return StockMoviment.restore({
            id: prismaSM.id,
            type: this.mapTypeToDomain(prismaSM.type),
            unitPrice: prismaSM.unitPrice,
            totalPrice: prismaSM.totalPrice,
            quantity: prismaSM.quantity,
            productStockId: prismaSM.productStockId,
            fromStockId: prismaSM.fromStockId ?? undefined,
            toStockId: prismaSM.toStockid ?? undefined,
            userId: prismaSM.userId,
            createdAt: prismaSM.createdAt,
            updatedAt: prismaSM.updatedAt,
            deletedAt: prismaSM.deletedAt ?? undefined,
        });
    }

    private toDomainWithRelations(prismaSM: StockMovimentWithRelations): StockMoviment {
        return StockMoviment.restore({
            id: prismaSM.id,
            type: this.mapTypeToDomain(prismaSM.type as PrismaStockMovimentType),
            unitPrice: prismaSM.unitPrice,
            totalPrice: prismaSM.totalPrice,
            quantity: prismaSM.quantity,
            productStockId: prismaSM.productStockId,
            fromStockId: prismaSM.fromStockId ?? undefined,
            toStockId: prismaSM.toStockid ?? undefined,
            userId: prismaSM.userId,
            createdAt: prismaSM.createdAt,
            updatedAt: prismaSM.updatedAt,
            deletedAt: prismaSM.deletedAt ?? undefined,

            fromStock: prismaSM.Stock_StockMoviment_fromStockIdToStock
                ? this.mapStock({
                    id: prismaSM.Stock_StockMoviment_fromStockIdToStock.id,
                    name: prismaSM.Stock_StockMoviment_fromStockIdToStock.name,
                    type: prismaSM.Stock_StockMoviment_fromStockIdToStock.type as StockType, // default se não veio
                    storeId: prismaSM.Stock_StockMoviment_fromStockIdToStock.Store?.id ?? undefined,
                    createdAt: prismaSM.Stock_StockMoviment_fromStockIdToStock.createdAt ?? new Date(),
                    updatedAt: prismaSM.Stock_StockMoviment_fromStockIdToStock.updatedAt ?? new Date(),
                    deletedAt: prismaSM.Stock_StockMoviment_fromStockIdToStock.deletedAt ?? undefined,
                    Store: this.normalizeStore(prismaSM.Stock_StockMoviment_fromStockIdToStock.Store),
                })
                : undefined,

            toStock: prismaSM.Stock_StockMoviment_toStockidToStock
                ? this.mapStock({
                    id: prismaSM.Stock_StockMoviment_toStockidToStock.id,
                    name: prismaSM.Stock_StockMoviment_toStockidToStock.name,
                    type: prismaSM.Stock_StockMoviment_toStockidToStock.type as StockType, // default se não veio
                    storeId: prismaSM.Stock_StockMoviment_toStockidToStock.Store?.id ?? undefined,
                    createdAt: prismaSM.Stock_StockMoviment_toStockidToStock.createdAt ?? new Date(),
                    updatedAt: prismaSM.Stock_StockMoviment_toStockidToStock.updatedAt ?? new Date(),
                    deletedAt: prismaSM.Stock_StockMoviment_toStockidToStock.deletedAt ?? undefined,
                    Store: this.normalizeStore(prismaSM.Stock_StockMoviment_toStockidToStock.Store),
                })
                : undefined,

            productStock: prismaSM.ProductStock
                ? ProductStock.restore({
                    ...prismaSM.ProductStock,
                    deletedAt: prismaSM.ProductStock.deletedAt ?? undefined,
                    product: prismaSM.ProductStock.product
                        ? Product.restore({
                            id: prismaSM.ProductStock.product.id,
                            colors: prismaSM.ProductStock.product.ProductColor.map(c => c.id),
                            materials: prismaSM.ProductStock.product.ProductMaterial.map(m => m.id),
                            name: prismaSM.ProductStock.product.name,
                            modelId: prismaSM.ProductStock.product.modelId,
                            normalizedName: prismaSM.ProductStock.product.normalizedName,
                            price: prismaSM.ProductStock.product.price,
                            sku: prismaSM.ProductStock.product.sku,
                            type: prismaSM.ProductStock.product.type as ProductType,
                            size: prismaSM.ProductStock.product.size as ProductSize,
                            barcode: prismaSM.ProductStock.product.barcode ?? undefined,
                            mlProductId: prismaSM.ProductStock.product.mlProductId ?? undefined,
                            createdAt: prismaSM.ProductStock.product.createdAt,
                            updatedAt: prismaSM.ProductStock.product.updatedAt,
                            deletedAt: prismaSM.ProductStock.product.deletedAt ?? undefined,
                        })
                        : undefined,

                    stock: prismaSM.ProductStock.stock
                        ? this.mapStock({
                            ...prismaSM.ProductStock.stock,
                            type: prismaSM.ProductStock.stock.type as StockType,
                            Store: this.normalizeStore(prismaSM.ProductStock.stock.Store),
                        })
                        : undefined,
                })
                : undefined,

                user: prismaSM.User
                    ? User.restore({
                        id: prismaSM.User.id,
                        name: prismaSM.User.name,
                        nickname: prismaSM.User.nickname,
                        password: Password.restore(prismaSM.User.password),
                        role: prismaSM.User.role as UserRole,
                        normalizedName: prismaSM.User.normalizedName,
                        createdAt: prismaSM.User.createdAt,
                        updatedAt: prismaSM.User.updatedAt,
                        deletedAt: prismaSM.User.deletedAt ?? undefined,
                    })
                    : undefined,
        });
    }

    private toPrismaCreate(sm: StockMoviment): Prisma.StockMovimentCreateInput {
        return {
            id: sm.id,
            type: sm.type as PrismaStockMovimentType,
            unitPrice: sm.unitPrice,
            totalPrice: sm.totalPrice,
            quantity: sm.quantity,
            ProductStock: { connect: { id: sm.productStockId } },
            Stock_StockMoviment_fromStockIdToStock: sm.fromStockId
                ? { connect: { id: sm.fromStockId } }
                : undefined,
            Stock_StockMoviment_toStockidToStock: sm.toStockId
                ? { connect: { id: sm.toStockId } }
                : undefined,
            User: { connect: { id: sm.userId } },
            createdAt: sm.createdAt,
            updatedAt: sm.updatedAt,
            deletedAt: null,
        };
    }

    private mapStock(prismaStock: {
        id: string;
        name: string;
        type: StockType;
        storeId?: string | null;
        createdAt: Date;
        updatedAt: Date;
        deletedAt?: Date | null;
        Store: { id: string; name: string, createdAt: Date, updatedAt: Date, deletedAt: Date | undefined } | undefined;
    }): Stock {
        return Stock.restore({
            id: prismaStock.id,
            name: prismaStock.name,
            type: prismaStock.type,
            storeId: prismaStock.storeId ?? undefined,
            store: prismaStock.Store ? Store.restore({
                id: prismaStock.Store.id,
                name: prismaStock.Store.name,
                createdAt: new Date(),
                updatedAt: new Date(),
                deletedAt: undefined,
            }) : undefined,
            createdAt: prismaStock.createdAt,
            updatedAt: prismaStock.updatedAt,
            deletedAt: prismaStock.deletedAt ?? undefined,
        });
    }

    private normalizeStore(store: { id: string; name: string; createdAt?: Date; updatedAt?: Date; deletedAt?: Date | null } | null): Store | undefined {
        if (!store) return undefined;

        return Store.restore({
            id: store.id,
            name: store.name,
            createdAt: store.createdAt ?? new Date(),
            updatedAt: store.updatedAt ?? new Date(),
            deletedAt: store.deletedAt ?? undefined,
        });
    }


    // converte type do prisma para o enum do sistema
    private mapTypeToDomain(type: PrismaStockMovimentType): StockMovimentType {
        return type as StockMovimentType;
    }

    // =========================
    // DEFAULT INCLUDE
    // =========================

    private readonly defaultInclude = {
        ProductStock: {
            include: {
                product: {
                    include: {
                        ProductColor: true,
                        ProductMaterial: true,
                    }
                },
                stock: {
                    select: {
                        id: true,
                        name: true,
                        type: true,
                        storeId: true,
                        createdAt: true,
                        updatedAt: true,
                        deletedAt: true,
                    }
                },
            }
        },

        User: true,

        Stock_StockMoviment_fromStockIdToStock: {
            select: {
                id: true,
                name: true,
                type: true,
                storeId: true,
                createdAt: true,
                updatedAt: true,
                deletedAt: true,
                Store: {
                    select: {
                        id: true,
                        name: true,
                        createdAt: true,
                        updatedAt: true,
                        deletedAt: true,
                    }
                }
            }
        },
        Stock_StockMoviment_toStockidToStock: {
            select: {
                id: true,
                name: true,
                type: true,
                storeId: true,
                createdAt: true,
                updatedAt: true,
                deletedAt: true,
                Store: {
                    select: {
                        id: true,
                        name: true,
                        createdAt: true,
                        updatedAt: true,
                        deletedAt: true,
                    }
                }
            }
        },
    } satisfies Prisma.StockMovimentInclude;
}