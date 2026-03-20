import { UserRepository } from "@/src/domain/repositories/user.repository";
import { SaveUserDto } from "../dto/user-save.dto";

export class UpdateUserUseCaseUseCase {
    constructor(
        private userRepository: UserRepository,
    ) {}

    async execute(props: SaveUserDto) {
        const { id, isActive, name, role } = props;

        const existingUser = await this.userRepository.findById(id);
        if(!existingUser) throw new Error("User not found");

        if(name) existingUser.rename(name);
        if(role) existingUser.changeRole(role);
        if(typeof isActive === "boolean"){
            if(isActive) existingUser.activate();
            else existingUser.deactivate();
        }

        await this.userRepository.save(existingUser);
    }
}