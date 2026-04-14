import { ProductRepository } from "@/src/domain/repositories/product.repository";
import { FindProductFilteredDto, FindProductListOutputDto, FindProductOutputDto } from "../dto/product-find.dto";
import { Product } from "@/src/domain/entities/product.entity";

export class FindProductsUseCase {
    constructor(private productRepository: ProductRepository) { }

    async execute(filters: FindProductFilteredDto): Promise<FindProductListOutputDto> {
        console.log("\n\nAPP >> USECASE >>\nFILTERS: ", filters)
        const page = filters.page && filters.page > 0 ? filters.page : 1;
        const limit = filters.limit && filters.limit > 0 ? filters.limit : 10;

        const { data, total } = await this.productRepository.findWithFilters({
            ...filters,
            page,
            limit,
        });
        // console.log("UC 'find' >> filters: ", filters);
        return {
            data: data.map(product => this.toOutput(product)),
            total,
            page,
            limit,
        };
    }

    private toOutput(product: Product): FindProductOutputDto {
        return {
            id: product.id,
            name: product.name,
            size: product.size,
            type: product.type,
            price: product.price,
            sku: product.sku,

            modelId: product.modelId,
            colorIds: product.colors,
            materialIds: product.materials,
            barcode: product.barcode,
            mlProductId: product.mlProductId,

            productColor: product.productColor ?? undefined,
            productMaterial: product.productMaterial ?? undefined,

            createdAt: product.createdAt,
            updatedAt: product.updatedAt,
            deletedAt: product.deletedAt,
        };
    }
}