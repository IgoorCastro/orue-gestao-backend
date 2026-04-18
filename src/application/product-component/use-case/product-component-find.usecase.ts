// Find em composição de produtos com filtro

import { FindProductComponentFilteredDto, FindProductComponentOutputDto } from "../dto/product-component-find.dto";
import { ProductComponentRepository } from "@/src/domain/repositories/product-component.repository";

export class FindProductComponentsUseCase {
    constructor(private productComponentRepository: ProductComponentRepository) { }

    async execute(filters: FindProductComponentFilteredDto): Promise<FindProductComponentOutputDto[]> {        
        const pcs = await this.productComponentRepository.findMany({
            ...filters,
        });
        
        return pcs.map(pc => ({
            id: pc.id,
            parentProductId: pc.parentProductId,
            componentProductId: pc.componentProductId,
            quantity: pc.quantity,
            componentProduct: pc.componentProduct,
            parentProduct: pc.parentProduct,
            createdAt: pc.createdAt,
            updatedAt: pc.updatedAt,
            deletedAt: pc.deletedAt,
        }))
    }
}