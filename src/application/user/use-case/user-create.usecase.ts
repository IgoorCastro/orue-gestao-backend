import { User } from "@/src/domain/entities/user.entity";
import { UserRepository } from "@/src/domain/repositories/user.repository";
import { CreateUserInputDTO, CreateUserOutputDTO } from "../dto/user-create.dto";
import { UuidGenerator } from "@/src/domain/services/uuid-generator.services";

export class CreateUserUseCase {
    constructor(
        private userRepository: UserRepository,
        private uuid: UuidGenerator,
    ) { }

    async execute({ name, role }: CreateUserInputDTO): Promise<CreateUserOutputDTO> {
        const existingUser = await this.userRepository.findByName(name);
        if (existingUser.length > 0) throw new Error("User already exists");

        // novo usuario
        const newUser = new User({
            id: this.uuid.generate(),
            role: role,
            isActive: true,
            createdAt: new Date(),
            name: name,
        });

        // inserindo no banco
        await this.userRepository.create(newUser);

        return {
            id: newUser.id,
            name: newUser.name,
            role: newUser.role,
            isActive: newUser.isActive,
            createdAt: newUser.createdAt,
        };
    }
}