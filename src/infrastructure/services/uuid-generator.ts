import { UuidGeneratorServices } from "@/src/domain/services/uuid-generator.services";
import { randomUUID } from "crypto"

export class UUIDGenerator implements UuidGeneratorServices {
    generate(): string {
        return randomUUID();
    }
}