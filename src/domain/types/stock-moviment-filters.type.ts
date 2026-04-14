import { StockMovimentType } from "../enums/stock-moviment-type.enum";

export type StockMovimentFilters = Readonly<{
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