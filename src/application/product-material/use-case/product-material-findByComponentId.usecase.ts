import { ProductComponentRepository } from "@/src/domain/repositories/product-component.repository";

export class FindProductComponentByComponentIdUseCase {
    constructor(
        private productComponentRepository: ProductComponentRepository,
    ) { }

    async execute(componentProduct: string) {
        if(!componentProduct || componentProduct.length === 0) throw new Error("Component product id cannot be empty");

        const existingPp = await this.productComponentRepository.findByComponentProductId(componentProduct);
        if(!existingPp) throw new Error("Product component not found");

        return existingPp;
    }
}