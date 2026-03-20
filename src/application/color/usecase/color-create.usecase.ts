import { ColorRepository } from "@/src/domain/repositories/color.repository";
import { UuidGenerator } from "@/src/domain/services/uuid-generator.services";
import { CreateColorInputDto, CreateColorOutputDto } from "../dto/color-create.dto";
import { Color } from "@/src/domain/entities/color.entity";

export class CreateColorUseCase {
    constructor(
        private colorRepository: ColorRepository,
        private uuid: UuidGenerator,
    ) { }

    async execute({ name }: CreateColorInputDto): Promise<CreateColorOutputDto> {
        if(!name) throw new Error("Name cannot be empty");
        
        const existingColor = await this.colorRepository.findByName(name);
        if(existingColor) throw new Error("Color is already exists");

        const color = Color.create({
            id: this.uuid.generate(),
            name,
        });

        await this.colorRepository.create(color);

        return {
            id: color.id,
            name: color.name,
        }
    }
}