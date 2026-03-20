// pc = Product Color
import { ProductColorRepository } from "@/src/domain/repositories/product-color.repository";
import { SaveProductColorInputDto, SaveProductColorOutputDto } from "../dto/product-color-save.dto";

export class UpdateProductColorUseCase {
    constructor(
        private productColorRepository: ProductColorRepository,
    ) { }

    async execute(props: SaveProductColorInputDto): Promise<SaveProductColorOutputDto> {
        const { id, colorId, productId } = props;

        const existingPc = await this.productColorRepository.findById(id);
        if(!existingPc) throw new Error("Product Color not found");

        if(colorId) existingPc.changeColorId(colorId);
        if(productId) existingPc.changeProductId(productId);

        await this.productColorRepository.save(existingPc);

        return {
            id: existingPc.id,
            colorId: existingPc.colorId,
            productId: existingPc.productId,
        }
    }
}