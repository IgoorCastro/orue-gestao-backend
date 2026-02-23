// contrato para o repositorio do usuario
import { User } from "../entities/User";
import { UserRole } from "../enums/UserRole.enum";

export interface UserRepository {
    save(material: User): Promise<void>;
    findById(id: string): Promise<User | null>;
    findByName(name: string): Promise<User[]>;
    findByRole(role: UserRole): Promise<User[]>
    findAll(): Promise<User[]>;
}