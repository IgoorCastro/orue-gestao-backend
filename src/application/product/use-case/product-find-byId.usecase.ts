import { ProductRepository } from "@/src/domain/repositories/product.repository";
import { FindProductByIdInputDto, FindProductOutputDto } from "../dto/product-find.dto";
import { ValidationError } from "@/src/domain/errors/validation.error";
import { NotFoundError } from "@/src/domain/errors/not-found.error";

export class FindProductByIdUseCase {
    constructor(
        private productRepository: ProductRepository,
    ) { }

    async execute(input: FindProductByIdInputDto): Promise<FindProductOutputDto> {
        if (!input.id?.trim()) throw new ValidationError("Product id cannot be empty");
        const product = await this.productRepository.findById(input.id);
        if (!product) throw new NotFoundError("User not found");

        return {
            id: product.id,
            name: product.name,
            price: product.price,
            type: product.type,
            size: product.size,
            colorIds: product.colors,
            materialIds: product.materials,
            modelId: product.modelId,
            sku: product.sku,
            barcode: product.barcode,
            mlProductId: product.mlProductId,
            createdAt: product.createdAt,
            updatedAt: product.updatedAt,
            deletedAt: product.deletedAt,
        };
    }
}