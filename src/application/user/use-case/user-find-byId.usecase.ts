import { UserRepository } from "@/src/domain/repositories/user.repository";
import { UuidGenerator } from "@/src/domain/services/uuid-generator.services";

export class FindUserByIdUseCase {
    constructor(
        private userRepository: UserRepository,
        private uuid: UuidGenerator,
    ) { }

    async execute(id: string) {
        if(!id) throw new Error("Id cannot be empty");
        
        const findedUser = await this.userRepository.findById(id);
        if(!findedUser) throw new Error("User not found");
        
        return findedUser;
    }
};