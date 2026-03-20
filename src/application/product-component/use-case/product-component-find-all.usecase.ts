import { ProductComponentRepository } from "@/src/domain/repositories/product-component.repository";

export class FindProductComponentAllUseCase {
    constructor(
        private productComponentRepository: ProductComponentRepository,
    ) { }

    async execute() {
        const existingPc = await this.productComponentRepository.findAll();
        if(!existingPc) throw new Error("Product component not found");

        return existingPc;
    }
}