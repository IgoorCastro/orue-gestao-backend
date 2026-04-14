import { ProductRepository } from "@/src/domain/repositories/product.repository";
import { RegenerateProductBarcodeInputDto, RegenerateProductBarcodeOutputDto } from "../dto/product-regenerate-bc.dto";
import { BarcodeGeneratorService } from "@/src/domain/services/barcode-generator.services";
import { ValidationError } from "@/src/domain/errors/validation.error";
import { NotFoundError } from "@/src/domain/errors/not-found.error";

export class RegenerateProductBarcodeUseCase {
    constructor(
        private productRepository: ProductRepository,
        private barcode: BarcodeGeneratorService,
    ) { }

    async execute(input: RegenerateProductBarcodeInputDto): Promise<RegenerateProductBarcodeOutputDto> {
        if (input.id?.trim()) throw new ValidationError("Id cannot be empty");

        const product = await this.productRepository.findById(input.id);
        if (!product) throw new NotFoundError("Product not found");

        let bc = ""; // barcode
        let exists = true;
        // roda até gerar um bc disponivel
        while (exists) {
            bc = await this.barcode.generate();
            exists = await this.productRepository.existsByBarcode(bc); // true para positivo
        }

        product.changeBarcode(bc);

        await this.productRepository.save(product);

        return {
            id: input.id,
            barcode: product.barcode ? product.barcode : "",
        }
    }
}