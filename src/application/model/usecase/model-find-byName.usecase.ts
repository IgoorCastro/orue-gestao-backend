import { ModelRepository } from "@/src/domain/repositories/model.repository";
import { FindModelByNameInputDto, FindModelOutputDto } from "../dto/model-find.dto";
import { ValidationError } from "@/src/domain/errors/validation.error";

export class FindModelByName {
    constructor(
        private modelRepository: ModelRepository,
    ) { }

    async execute(input: FindModelByNameInputDto): Promise<FindModelOutputDto[]> {
        if (!input.name?.trim()) throw new ValidationError("Name cannot be empty");

        const findedModel = await this.modelRepository.findByName(input.name);

        return findedModel.map(model => ({
            id: model.id,
            name: model.name,
            normalizedName: model.normalizedName,
            createdAt: model.createdAt,
            updatedAt: model.updatedAt,
            deletedAt: model.deletedAt,
        }));
    }
}