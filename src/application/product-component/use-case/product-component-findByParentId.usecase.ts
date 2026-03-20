import { ProductComponentRepository } from "@/src/domain/repositories/product-component.repository";

export class FindProductComponentByParentIdUseCase {
    constructor(
        private productComponentRepository: ProductComponentRepository,
    ) { }

    async execute(parentProductId: string) {
        if(!parentProductId || parentProductId.length === 0) throw new Error("Parent product id cannot be empty");

        const existingPp = await this.productComponentRepository.findByParentProductId(parentProductId);
        if(!existingPp) throw new Error("Product component not found");

        return existingPp;
    }
}