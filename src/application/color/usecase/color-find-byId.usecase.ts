import { ColorRepository } from "@/src/domain/repositories/color.repository";
import { UpdateColorInputDto, UpdateColorOutuputDto } from "../dto/color-save-dto";
import { Color } from "@/src/domain/entities/color.entity";

export class UpdateColorByIdUseCase {
    constructor(private colorRepository: ColorRepository) { }

    async execute({ id, name }: UpdateColorInputDto): Promise<UpdateColorOutuputDto> {
        if(!id || id.length === 0) throw new Error("Id cannot be empty");
        
        const existingColor = await this.colorRepository.findById(id);
        if(!existingColor) throw new Error("Color not found");

        if(name !== undefined) existingColor.rename(name);
        await this.colorRepository.save(existingColor);

        return {
            id: existingColor.id,
            name: existingColor.name,
        }
    }
}