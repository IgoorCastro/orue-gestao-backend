import { UserRepository } from "@/src/domain/repositories/user.repository";
import { FindUserByIdInputDto, FindUserOutputDto } from "../dto/user-find.dto";
import { ValidationError } from "@/src/domain/errors/validation.error";
import { NotFoundError } from "@/src/domain/errors/not-found.error";

export class FindUserByIdUseCase {
    constructor(
        private userRepository: UserRepository,
    ) { }

    async execute(input: FindUserByIdInputDto): Promise<FindUserOutputDto> {
        if(!input.id?.trim()) throw new ValidationError("Id cannot be empty");
        
        const user = await this.userRepository.findById(input.id);
        if(!user) throw new NotFoundError("User not found");
        
        return {
            id: user.id,
            name: user.name,
            role: user.role,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
            deletedAt: user.deletedAt,
        };
    }
};