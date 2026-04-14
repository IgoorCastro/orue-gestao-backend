import { StockMovimentType } from "@/src/domain/enums/stock-moviment-type.enum";
import { StockRepository } from "@/src/domain/repositories/stock.repository";

type FindStockMovimentFilteredInputDto = {
    readonly type?: string;
    readonly quantity?: string;
    readonly fromStockId?: string;
    readonly toStockId?: string;
    readonly productStockId?: string;
    readonly userId?: string;

    readonly priceGte?: number;
    readonly priceLte?: number;

    readonly createdAtGte?: string;
    readonly createdAtLte?: string;

    readonly orderBy?: string;
    readonly page?: number;
    readonly limit?: number;
}


export type FindStockMovimentFilteredOutputDto = Readonly<{
    type?: StockMovimentType;
    quantity?: number;
    fromStockId?: string;
    toStockId?: string;
    productStockId?: string;
    userId?: string;

    price?: {
        gte?: number;
        lte?: number;
    };

    createdAt?: {
        gte?: Date;
        lte?: Date;
    };

    page?: number;
    limit?: number;

    orderBy?: {
        field: "createdAt" | "quantity" | "totalPrice";
        direction: "asc" | "desc";
    };
}>

export class StockMovimentFilterMapper {

    async map(input: FindStockMovimentFilteredInputDto): Promise<FindStockMovimentFilteredOutputDto> {
        const price =
            input.priceGte !== undefined || input.priceLte !== undefined
                ? {
                    ...(input.priceGte !== undefined && {
                        gte: Number(input.priceGte)
                    }),
                    ...(input.priceLte !== undefined && {
                        lte: Number(input.priceLte)
                    }),
                }
                : undefined;

        const createdAt =
            input.createdAtGte !== undefined || input.createdAtLte !== undefined
                ? {
                    ...(input.createdAtGte !== undefined && {
                        gte: new Date(input.createdAtGte)
                    }),
                    ...(input.createdAtLte !== undefined && {
                        lte: new Date(input.createdAtLte)
                    }),
                }
                : undefined;

        return {
            type: this.mapType(input.type),
            quantity: input.quantity ? Number(input.quantity) : undefined,
            fromStockId: input.fromStockId,
            toStockId: input.toStockId,
            productStockId: input.productStockId,
            userId: input.userId,

            price,
            createdAt,

            page: input.page ? Number(input.page) : undefined,
            limit: input.limit ? Number(input.limit) : undefined,

            orderBy: this.mapOrderBy(input.orderBy),
        };
    }

    // =========================
    // HELPERS
    // =========================

    private mapType(type?: string): StockMovimentType | undefined {
        if (!type) return undefined;

        const allowed = Object.values(StockMovimentType);
        return allowed.includes(type as StockMovimentType)
            ? (type as StockMovimentType)
            : undefined;
    }

    private mapOrderBy(orderBy?: string) {
        if (!orderBy) return undefined;

        const [field, direction] = orderBy.split(":");

        const allowedFields = ["createdAt", "quantity", "totalPrice"];
        const allowedDirections = ["asc", "desc"];

        if (
            !allowedFields.includes(field) ||
            !allowedDirections.includes(direction)
        ) {
            return undefined;
        }

        return {
            field: field as "createdAt" | "quantity" | "totalPrice",
            direction: direction as "asc" | "desc",
        };
    }
}