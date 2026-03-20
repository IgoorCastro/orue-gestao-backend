import { UuidGenerator } from "@/src/domain/services/uuid-generator.services";
import { randomUUID } from "crypto"

export class UUIDGenerator implements UuidGenerator {
    generate(): string {
        return randomUUID();
    }
}