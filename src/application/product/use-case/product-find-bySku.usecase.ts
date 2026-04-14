import { ProductRepository } from "@/src/domain/repositories/product.repository";
import { FindProductOutputDto } from "../dto/product-find.dto";
import { ValidationError } from "@/src/domain/errors/validation.error";
import { NotFoundError } from "@/src/domain/errors/not-found.error";

type FindProductBySkuProps = {
    sku: string,
}

export class FindProductBySkuUseCase {
    constructor(
        private productRepository: ProductRepository,
    ) { }

    async execute(input: FindProductBySkuProps): Promise<FindProductOutputDto> {
        if (!input) throw new ValidationError("Product sku cannot be empty");
        const product = await this.productRepository.findBySku(input.sku);
        if (!product) throw new NotFoundError("Product not found");

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