import { ProductComponentRepository } from "@/src/domain/repositories/product-component.repository";

export class FindProductComponentByIdUseCase {
    constructor(
        private productComponentRepository: ProductComponentRepository,
    ) { }

    async execute(id: string) {
        if(!id || id.length === 0) throw new Error("Id cannot be empty");

        const existingPc = await this.productComponentRepository.findById(id);
        if(!existingPc) throw new Error("Product component not found");

        return existingPc;
    }
}