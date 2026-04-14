import { ModelRepository } from "@/src/domain/repositories/model.repository";
import { FindModelOutputDto } from "../dto/model-find.dto";

export class FindModelAllUseCase {
    constructor(
        private modelRepository: ModelRepository,
    ) {}

    async execute(): Promise<FindModelOutputDto[]> {
        const models = await this.modelRepository.findAll();

        return models.map(model => ({
            id: model.id,
            name: model.name,
            normalizedName: model.normalizedName,
            createdAt: model.createdAt,
            updatedAt: model.updatedAt,
            deletedAt: model.deletedAt,
        }));
    }
}