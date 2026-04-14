// map recebe todos os filtros para pesquisa de produtos
// retorna um novo filtro com os ids das cores e materiais

import { ProductSize } from "@/src/domain/enums/product-size.enum";
import { ProductType } from "@/src/domain/enums/product-type.enum";
import { ColorRepository } from "@/src/domain/repositories/color.repository";
import { MaterialRepository } from "@/src/domain/repositories/material.repository";
import { ModelRepository } from "@/src/domain/repositories/model.repository";

type FindProductFilteredInputDto = {
    readonly name?: string;
    readonly barcode?: string;
    readonly mlProductId?: string;
    readonly type?: ProductType;
    readonly size?: string;
    readonly models?: string[];
    readonly colors?: string[];
    readonly materials?: string[];
    readonly minPrice?: string;
    readonly maxPrice?: string;
    readonly orderBy?: string;
    readonly page?: number;
    readonly limit?: number;
}

export type FindProductFilteredOutputDto = Readonly<{
    name?: string,
    barcode?: string,
    type?: ProductType,
    mlProductId?: string,
    colorIds?: string[];
    materialIds?: string[];
    modelIds?: string[];
    size?: ProductSize;
    page?: number;
    limit?: number;
    price?: {
        gte?: number,
        lte?: number,
    },
    maxPrice?: number,
    minPrice?: number,
    orderBy?: {
        field: "name" | "price" | "createdAt";
        direction: "asc" | "desc";
    };
}>

export class ProductFilterMapper {
    constructor(
        private readonly colorRepository: ColorRepository,
        private readonly materialRepository: MaterialRepository,
        private readonly modelRepository: ModelRepository,
    ) { }

    async map(input: FindProductFilteredInputDto): Promise<FindProductFilteredOutputDto> {
        const minPrice = input.minPrice ? Number(input.minPrice) : 0;
        const maxPrice = input.maxPrice ? Number(input.maxPrice) : undefined;

        // convertendo materais para materiaisId
        const materialIds = input.materials?.length
            ? (await this.materialRepository.findByNames(input.materials)).map(m => m.id)
            : undefined;

        // convertendo modelos para modelId
        const modelIds = input.models?.length
            ? (await this.modelRepository.findByNames(input.models)).map(m => m.id)
            : undefined;                    

        // validar o size e tipo 
        // para evitar erros
        const allowedSizes = Object.values(ProductSize);
        const size = allowedSizes.includes(input.size as ProductSize)
            ? input.size as ProductSize
            : undefined;

        const allowedTypes = Object.values(ProductType);
        const type = allowedTypes.includes(input.type as ProductType)
            ? input.type as ProductType
            : undefined;
        return {
            name: input.name,
            maxPrice,
            minPrice,
            type,
            size,
            barcode: input.barcode,
            mlProductId: input.mlProductId,
            modelIds,
            colorIds: input.colors,
            materialIds,
            orderBy: this.mapOrderBy(input.orderBy),
            page: input.page,
            limit: input.limit,
        }
    }

    // map para orderBy
    // recebe como string e retorna
    // field e direction tipados
    private mapOrderBy(orderBy?: string) {
        if (!orderBy) return undefined;

        const [field, direction] = orderBy.split(":");

        const allowedFields = ["name", "price", "createdAt"];
        const allowedDirections = ["asc", "desc"];

        if (
            !allowedFields.includes(field) ||
            !allowedDirections.includes(direction)
        ) {
            return undefined; // ou throw error
        }

        return {
            field: field as "name" | "price" | "createdAt",
            direction: direction as "asc" | "desc",
        };
    }
}