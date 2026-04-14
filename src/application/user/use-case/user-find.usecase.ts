import { UserRole } from "@/src/domain/enums/user-role.enum";
import { UserRepository } from "@/src/domain/repositories/user.repository";
import { FindUserFilteredDto, FindUserOutputDto } from "../dto/user-find.dto";

type Input = {
    id?: string;
    name?: string;
    role?: UserRole;
    nickname?: string,
};

export class FindUsersUseCase {
    constructor(private readonly userRepository: UserRepository) {}
    async execute(input: FindUserFilteredDto): Promise<FindUserOutputDto[]> {

        const users = await this.userRepository.findMany({
            name: input.name,
            role: input.role,
            nickname: input.nickname,
        });

        return users.map(user => ({
            id: user.id,
            name: user.name,
            nickname: user.nickname,
            role: user.role,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
            deletedAt: user.deletedAt,
        }))
    }
}