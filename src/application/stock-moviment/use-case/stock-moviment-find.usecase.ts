// Find de movimentação de estoque com filtro
// Filtros permitidos: type, min/ maxPrice, quantity, productStockId, fromStockId, toStockId, userId

import { StockMovimentRepository } from "@/src/domain/repositories/stock-moviment.repository";
import { FindStockMovimentFilteredDto, FindStockMovimentListOutputDto, FindStockMovimentOutputDto } from "../dto/stock-moviment-find.dto";
import { StockMoviment } from "@/src/domain/entities/stock-moviment.entity";
import { User } from "@/src/domain/entities/user.entity";

export class FindStockMovimentsUseCase {
    constructor(private smRepository: StockMovimentRepository) { }

    async execute(filters: FindStockMovimentFilteredDto): Promise<FindStockMovimentListOutputDto> {
        const page = filters.page && filters.page > 0 ? filters.page : 1;
        const limit = filters.limit && filters.limit > 0 ? filters.limit : 12;

        const { data, total } = await this.smRepository.findWithFilters({
            ...filters,
            page,
            limit,
        });

        // console.log(data.map(sm => this.toOutput(sm)));

        return {
            data: data.map(sm => this.toOutput(sm)),
            total,
            page,
            limit,
        }
    }

    // map para saida
    private toOutput(sm: StockMoviment): FindStockMovimentOutputDto {
    try {
        return {
            id: sm.id,
            type: sm.type,
            unitPrice: sm.unitPrice,
            totalPrice: sm.totalPrice,
            quantity: sm.quantity,
            productStockId: sm.productStockId,
            fromStockId: sm.fromStockId,
            toStockId: sm.toStockId,
            userId: sm.userId,

            fromStock: sm.fromStock ? {
                id: sm.fromStock.id,
                name: sm.fromStock.name,
                type: sm.fromStock.type,
                storeId: sm.fromStock.storeId,
                createdAt: sm.fromStock.createdAt,
                updatedAt: sm.fromStock.updatedAt,
                deletedAt: sm.fromStock.deletedAt,
                store: sm.fromStock.store && typeof sm.fromStock.store === 'object' ? {
                    id: (sm.fromStock.store as any).id,
                    name: (sm.fromStock.store as any).name,
                    type: (sm.fromStock.store as any).type,
                    createdAt: (sm.fromStock.store as any).createdAt,
                    updatedAt: (sm.fromStock.store as any).updatedAt,
                } : undefined,
            } : undefined,

            toStock: sm.toStock ? {
                id: sm.toStock.id,
                name: sm.toStock.name,
                type: sm.toStock.type,
                storeId: sm.toStock.storeId,
                createdAt: sm.toStock.createdAt,
                updatedAt: sm.toStock.updatedAt,
                deletedAt: sm.toStock.deletedAt,
                store: sm.toStock.store && typeof sm.toStock.store === 'object' ? {
                    id: (sm.toStock.store as any).id,
                    name: (sm.toStock.store as any).name,
                    type: (sm.toStock.store as any).type,
                    createdAt: (sm.toStock.store as any).createdAt,
                    updatedAt: (sm.toStock.store as any).updatedAt,
                } : undefined,
            } : undefined,

            productStock: sm.productStock ? {
            id: sm.productStock.id,
            productId: sm.productStock.productId,
            quantity: sm.productStock.quantity,
            stockId: sm.productStock.stockId,
            createdAt: sm.productStock.createdAt,
            updatedAt: sm.productStock.updatedAt,
            deletedAt: sm.productStock.deletedAt,
            product: sm.productStock.product ? {
                id: sm.productStock.product.id,
                name: sm.productStock.product.name,
                price: sm.productStock.product.price,
                type: sm.productStock.product.type,
                normalizedName: sm.productStock.product.normalizedName,
                sku: sm.productStock.product.sku,
                size: sm.productStock.product.size,
                barcode: sm.productStock.product.barcode,
                mlProductId: sm.productStock.product.mlProductId,
                modelId: sm.productStock.product.modelId,
                createdAt: sm.productStock.product.createdAt,
                updatedAt: sm.productStock.product.updatedAt,
                deletedAt: sm.productStock.product.deletedAt,
                colors: sm.productStock.product.colors,
                materials: sm.productStock.product.materials,
            } : undefined,
        } : undefined,

        user: sm.user
            ? User.restore({
                id: sm.user.id,
                name: sm.user.name,
                nickname: sm.user.nickname,
                password: sm.user.password,
                role: sm.user.role,
                normalizedName: sm.user.normalizedName,
                createdAt: sm.createdAt,
                updatedAt: sm.updatedAt,
                deletedAt: sm.deletedAt ?? undefined,
            })
            : undefined,

            createdAt: sm.createdAt,
            updatedAt: sm.updatedAt,
            deletedAt: sm.deletedAt,
        };
    } catch (error) {
        console.error("Erro mapeando StockMoviment ID:", sm.id, error);
        throw error; // Isso vai mostrar no console EXATAMENTE qual campo está nulo
    }
}
}