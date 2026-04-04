import { ConflictError } from "@/src/domain/errors/conflict.error";
import { DomainError } from "@/src/domain/errors/domain.error";
import { NotFoundError } from "@/src/domain/errors/not-found.error";
import { ValidationError } from "@/src/domain/errors/validation.error";

export default function mapDomainErrorToStatus(error: DomainError): number {
    if (error instanceof ValidationError) return 400;
    if (error instanceof ConflictError) return 409;
    if (error instanceof NotFoundError) return 404;

    return 400;
}