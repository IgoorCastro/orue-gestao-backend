// contrato para o repositorio do usuario
import { User } from "../entities/user.entity";
import { UserRole } from "../enums/user-role.enum";

export interface UserRepository {
    create(user: User): Promise<void>;
    findById(id: string): Promise<User | null>;
    findByName(name: string): Promise<User[]>;
    findByRole(role: UserRole): Promise<User[]>
    findAll(): Promise<User[]>;
    existsByName(name: string): Promise<boolean>;
    save(user: User): Promise<void>;
}