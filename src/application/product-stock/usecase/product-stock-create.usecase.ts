import { ProductStockRepository } from "@/src/domain/repositories/product-stock.repository";
import { CreateProductStockInputDto, CreateProductStockOutuputDto } from "../dto/product-stock-create.dto";
import { ProductStock } from "@/src/domain/entities/product-stock.entity";
import { UuidGenerator } from "@/src/domain/services/uuid-generator.services";

export class CreateProductStockUseCase {
    constructor(
        private productStockRepository: ProductStockRepository,
        private uuid: UuidGenerator,
    ) { }

    async execute(input: CreateProductStockInputDto): Promise<CreateProductStockOutuputDto> {
        const existingProductStock = await this.productStockRepository.findByProductAndStockId(input.stockId, input.productId);
        if(existingProductStock) throw new Error("Product is already registered in this stock");

        const productStock = new ProductStock({
            id: this.uuid.generate(),
            productId: input.productId,
            quantity: input.quantity,
            stockId: input.stockId,
        });

        await this.productStockRepository.create(productStock);

        return {
            id: productStock.id,
            stockId: productStock.stockId,
            productId: productStock.productId,
            quantity: productStock.quantity,
        }
    }
}