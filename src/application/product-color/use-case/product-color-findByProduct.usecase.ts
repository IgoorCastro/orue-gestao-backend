import { ProductColorRepository } from "@/src/domain/repositories/product-color.repository";

export class FindProductColorByProductId {
    constructor(
        private productColorRepository: ProductColorRepository,
    ) { }

    async execute(productId: string) {
        if(productId) throw new Error("Id cannot be empty");

        const existingPc = await this.productColorRepository.findByProductId(productId);
        if(!existingPc) throw new Error("Product color not found");

        return existingPc;
    }
}