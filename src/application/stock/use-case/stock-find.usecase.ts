// Find de estoque com filtros

import { StockRepository } from "@/src/domain/repositories/stock.repository";
import { FindStockFilteredDto, FindStockOutputDto } from "../dto/stock-find.dto";

export class FindStocksUseCase {
    constructor(private stockRepository: StockRepository) { }

    async execute(filters: FindStockFilteredDto): Promise<FindStockOutputDto[]> {
        const pcs = await this.stockRepository.findMany({
            ...filters,
        });

        // console.log("PCS: ", pcs)

        return pcs.map(pc => ({
            id: pc.id,
            name: pc.name,
            type: pc.type,

            storeId: pc.storeId,
            store: pc.store,

            createdAt: pc.createdAt,
            updatedAt: pc.updatedAt,
            deletedAt: pc.deletedAt,
        }))
    }
}