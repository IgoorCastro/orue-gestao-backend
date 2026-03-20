import { ProductColorRepository } from "@/src/domain/repositories/product-color.repository";
import { UuidGenerator } from "@/src/domain/services/uuid-generator.services";
import { CreateProductColorInputDto, CreateProductColorOutputDto } from "../dto/product-color-create.dto";
import { ProductColor } from "@/src/domain/entities/product-color";

export class CreateProductColorUseCase {
    constructor(
        private productColorRepository: ProductColorRepository,
        private uuid: UuidGenerator,
    ) {}

    async execute(input: CreateProductColorInputDto): Promise<CreateProductColorOutputDto> {
        // verifica se ja existe relação entre uma cor e um produto
        const existingProductColor = await this.productColorRepository.findByProductAndColorId(input.colorId, input.productId);
        if(existingProductColor) throw new Error("Product color is already registered");

        const pc = new ProductColor({
            id: this.uuid.generate(),
            colorId: input.colorId,
            productId: input.productId,
        });

        await this.productColorRepository.create(pc);

        return {
            id: pc.id,
            colorId: pc.colorId,
            productId: pc.productId,
        }
    }
}