import { ModelRepository } from "@/src/domain/repositories/model.repository";
import { FindModelOutputDto } from "../dto/model-find.dto";
import { NotFoundError } from "@/src/domain/errors/not-found.error";

type Input = {
    id?: string;
    name?: string;
};

export class FindModelsUseCase {
    constructor(private readonly modelRepository: ModelRepository) { }
    async execute({ id, name }: Input): Promise<FindModelOutputDto | FindModelOutputDto[]> {
        // caso o find for por ID
        if (id) {
            const model = await this.modelRepository.findById(id);
            if (!model) throw new NotFoundError("Model not found");
            
            return {
                id: model.id,
                name: model.name,
                normalizedName: model.normalizedName,
                createdAt: model.createdAt,
                updatedAt: model.updatedAt,
                deletedAt: model.deletedAt,
            }
        }

        const model = await this.modelRepository.findMany({ name: name });

        return model.map(m => ({
            id: m.id,
            name: m.name,
            normalizedName: m.normalizedName,
            createdAt: m.createdAt,
            updatedAt: m.updatedAt,
            deletedAt: m.deletedAt,
        }))
    }
}