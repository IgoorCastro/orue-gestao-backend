import { ModelRepository } from "@/src/domain/repositories/model.repository";
import { FindModelByIdInputDto, FindModelOutputDto } from "../dto/model-find.dto";
import { ValidationError } from "@/src/domain/errors/validation.error";
import { NotFoundError } from "@/src/domain/errors/not-found.error";

export class FindModelByIdUseCase {
    constructor(
        private modelRepository: ModelRepository,
    ) { }

    async execute(input: FindModelByIdInputDto): Promise<FindModelOutputDto> {
        if (!input.id?.trim()) throw new ValidationError("Model id is required");

        const findedModel = await this.modelRepository.findById(input.id);
        if (!findedModel) throw new NotFoundError("Model not found");

        return {
            id: findedModel.id,
            name: findedModel.name,
            normalizedName: findedModel.normalizedName,
            createdAt: findedModel.createdAt,
            updatedAt: findedModel.updatedAt,
            deletedAt: findedModel.deletedAt,
        };
    }
}