import { ProductRepository } from "@/src/domain/repositories/product.repository";
import { FindProductOutputDto } from "../dto/product-find.dto";

export class FindProductsAllUseCase {
    constructor(
        private productRepository: ProductRepository,
    ) { }

    async execute(): Promise<FindProductOutputDto[]> {
        const findedProduct = await this.productRepository.findAll();

        return findedProduct.map(p => ({
            id: p.id,
            name: p.name,
            price: p.price,
            type: p.type,
            size: p.size,
            colorIds: p.colors,
            materialIds: p.materials,
            modelId: p.modelId,
            sku: p.sku,
            barcode: p.barcode,
            mlProductId: p.mlProductId,
            createdAt: p.createdAt,
            updatedAt: p.updatedAt,
            deletedAt: p.deletedAt,
        }));
    }
}