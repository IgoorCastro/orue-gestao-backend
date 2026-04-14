import { ProductRepository } from "@/src/domain/repositories/product.repository";
import { FindProductByNameInputDto, FindProductOutputDto } from "../dto/product-find.dto";
import { ValidationError } from "@/src/domain/errors/validation.error";

export class FindProductsByNameUseCase {
    constructor(
        private productRepository: ProductRepository,
    ) { }

    async execute(input: FindProductByNameInputDto): Promise<FindProductOutputDto[]> {
        if(!input) throw new ValidationError("Product name cannot be empty");
        const products = await this.productRepository.findByName(input.name);
        
        return products.map(p => ({
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