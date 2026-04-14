// Find em composição de produtos com filtro

import { ProductSize } from "@/src/domain/enums/product-size.enum";
import { FindProductStockFilteredDto, FindProductStockOutputDto } from "../dto/product-stock-find.dto";
import { ProductStockRepository } from "@/src/domain/repositories/product-stock.repository";
import { StockType } from "@/generated/prisma/enums";

export class FindProductStocksUseCase {
    constructor(private productStockRepository: ProductStockRepository) { }

    async execute(filters: FindProductStockFilteredDto): Promise<FindProductStockOutputDto[]> {
        const pcs = await this.productStockRepository.findMany({
            ...filters,
        });


        return pcs.map(pc => ({
            id: pc.id,
            productId: pc.productId,
            stockId: pc.stockId,
            quantity: pc.quantity,
            createdAt: pc.createdAt,
            updatedAt: pc.updatedAt,
            deletedAt: pc.deletedAt,

            product: pc.product
                ? {
                    id: pc.product.id,
                    name: pc.product.name,
                    price: pc.product.price,
                    barcode: pc.product.barcode,
                    size: pc.product.size as ProductSize,
                    sku: pc.product.sku,
                    type: pc.product.type,
                }
                : undefined,
                
            stock: pc.stock
                ? {
                    id: pc.stock.id,
                    name: pc.stock.name,
                    type: pc.stock.type as StockType,
                    store: pc.stock.store,
                }
                : undefined,
        }))
    }
}