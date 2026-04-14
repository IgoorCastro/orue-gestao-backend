import { ColorRepository } from "@/src/domain/repositories/color.repository";
import { FindColorFilteredDto, FindColorOutputDto } from "../dto/color-find.dto";

export class FindColorsUseCase {
    constructor(private readonly colorRepository: ColorRepository) {}
    async execute(filters: FindColorFilteredDto): Promise<FindColorOutputDto[]> {

        const colors = await this.colorRepository.findMany({
            ...filters,
        })

        return colors.map(c => ({
            id: c.id,
            name: c.name,
            createdAt: c.createdAt,
            updatedAt: c.updatedAt,
            deletedAt: c.deletedAt,
        }))
    }
}