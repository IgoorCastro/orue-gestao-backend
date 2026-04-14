// usecase para restaurar um usuario 'deleteado

import { UserRepository } from "@/src/domain/repositories/user.repository";
import { RestoreUserByIdInputUseCase } from "../dto/user-restore.dto";
import { ValidationError } from "@/src/domain/errors/validation.error";
import { NotFoundError } from "@/src/domain/errors/not-found.error";

export class UserRestoreByIdUseCase {
    constructor(private readonly userRepository: UserRepository) { }

    async execute(input: RestoreUserByIdInputUseCase) {
        if(!input.id?.trim()) throw new ValidationError("Id cannot be empty");

        const user = await this.userRepository.findById(input.id);
        if(!user) throw new NotFoundError("User not found");

        user.restoreDeleted();

        await this.userRepository.save(user);
    }
}