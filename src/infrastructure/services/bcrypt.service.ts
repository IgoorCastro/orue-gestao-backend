import bcrypt from "bcrypt";
import { HashService } from "@/src/domain/services/hash.service";

export class BcryptService implements HashService {
    async hash(value: string): Promise<string> {
        return bcrypt.hash(value, 10);
    }

    async compare(value: string, hash: string): Promise<boolean> {
        return bcrypt.compare(value, hash);
    }
}