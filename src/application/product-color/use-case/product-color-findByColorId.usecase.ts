import { ProductColorRepository } from "@/src/domain/repositories/product-color.repository";

export class FindProductColorByColorId {
    constructor(
        private productColorRepository: ProductColorRepository,
    ) { }

    async execute(colorId: string) {
        if(colorId) throw new Error("Id cannot be empty");

        const existingPc = await this.productColorRepository.findByColorId(colorId);
        if(!existingPc) throw new Error("Product color not found");

        return existingPc;
    }
}