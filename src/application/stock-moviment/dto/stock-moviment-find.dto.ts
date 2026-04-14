import { ProductSize, StockType } from "@/generated/prisma/enums";
import { ProductStock } from "@/src/domain/entities/product-stock.entity";
import { Stock } from "@/src/domain/entities/stock.entity";
import { User } from "@/src/domain/entities/user.entity";
import { StockMovimentType } from "@/src/domain/enums/stock-moviment-type.enum";

export type FindStockMovimentByIdInputDto = Readonly<{
    id: string,
}>;

export type FindStockMovimentFilteredDto = Readonly<{
    type?: StockMovimentType,
    quantity?: number,
    fromStockId?: string,
    toStockId?: string,
    productStockId?: string,
    userId?: string,
    page?: number;
    limit?: number;
    price?: {
        gte?: number,
        lte?: number,
    },
    createdAt?: {
        gte?: Date;
        lte?: Date;
    };
    orderBy?: {
        field: "createdAt" | "quantity" | "totalPrice";
        direction: "asc" | "desc";
    };
}>;

// Tipos auxiliares para os relacionamentos (Objetos planos)
type StoreOutput = {
    id: string;
    name: string;
    type: StockType,
    createdAt: Date;
    updatedAt: Date;
    deletedAt?: Date;
};

type StockOutput = {
    id: string;
    name: string;
    type: string;
    storeId?: string;
    store?: StoreOutput;
    createdAt: Date;
    updatedAt: Date;
    deletedAt?: Date;
};

type ProductOutput = {
    id: string;
    name: string;
    price: number;
    type: string;
    sku: string;
    normalizedName: string,
    size?: ProductSize,
    barcode?: string,
    mlProductId?: string,
    modelId: string,
    deletedAt?: Date,
    createdAt: Date;
    updatedAt: Date;

    colors: string[],
    materials: string[],
};

type ProductStockOutput = {
    id: string;
    productId: string;
    quantity: number;
    stockId: string;
    product?: ProductOutput;
    createdAt: Date;
    updatedAt: Date;
    deletedAt?: Date;
};

// O DTO principal atualizado
export type FindStockMovimentOutputDto = Readonly<{
    id: string,
    type: StockMovimentType,
    unitPrice: number,
    totalPrice: number,
    quantity: number,

    fromStockId?: string,
    toStockId?: string,
    productStockId: string,
    userId: string,

    fromStock?: StockOutput,
    toStock?: StockOutput,
    productStock?: ProductStockOutput,
    user?: User;

    createdAt: Date,
    updatedAt: Date,
    deletedAt?: Date,
}>;

export type FindStockMovimentListOutputDto = Readonly<{
    data: FindStockMovimentOutputDto[];
    total: number;
    page: number;
    limit: number;
}>