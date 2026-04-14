import { StockRepository } from "@/src/domain/repositories/stock.repository";
import { FindStockByIdInputDto, FindStockOutputDto } from "../dto/stock-find.dto";

export class FindStockByIdUseCase {
    constructor(
        private stockRepository: StockRepository,
    ) { }

    async execute(input: FindStockByIdInputDto): Promise<FindStockOutputDto> {
        if(!input.id?.trim()) throw new Error("Id cannot be empty");

        const stock = await this.stockRepository.findById(input.id);
        if(!stock) throw new Error("Stock not found");

        return {
            id: stock.id,
            name: stock.name,
            type: stock.type,
            storeId: stock.storeId,
            createdAt: stock.createdAt,
            updatedAt: stock.updatedAt,
            deletedAt: stock.deletedAt,
        };
    }
}