import { MaterialRepository } from "@/src/domain/repositories/material.repository";
import { FindMaterialFilteredDto, FindMaterialOutputDto } from "../dto/material-find.dto";

export class FindMaterialsUseCase {
    constructor(private readonly materialRepository: MaterialRepository) {}
    async execute(filters: FindMaterialFilteredDto): Promise<FindMaterialOutputDto[]> {

        const materials = await this.materialRepository.findMany({
            ...filters,
        })

        return materials.map(m => ({
            id: m.id,
            name: m.name,
            createdAt: m.createdAt,
            updatedAt: m.updatedAt,
            deletedAt: m.deletedAt,
        }))
    }
}