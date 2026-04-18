import { ProductType } from "../enums/product-type.enum";

export interface GenerateSkuInput {
    name: string;
    model?: string;
    material?: string[];
    color?: string[];
    size?: string;
    type: ProductType,
}

export interface SkuGeneratorService {
    generate(input: GenerateSkuInput): string;
}