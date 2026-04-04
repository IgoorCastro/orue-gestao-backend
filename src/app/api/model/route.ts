import { DomainError } from "@/src/domain/errors/domain.error";
import { prisma } from "@/src/infrastructure/database/prisma/client";
import { UUIDGenerator } from "@/src/infrastructure/services/uuid-generator";
import { NextRequest, NextResponse } from "next/server";
import mapDomainErrorToStatus from "../mapDomainErrorToStatus.error";
import { PrismaModelRepository } from "@/src/infrastructure/database/repositories/prisma-model.repository";
import { CreateModelUseCase } from "@/src/application/model/usecase/model-create.usecase";
import { FindModelsUseCase } from "@/src/application/model/usecase/model-find.usecase";

// Rota para criação de um novo modelo
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();

        // body esperado para novo modelo
        const { name } = body;

        function makeCreateModelUseCase() {
            const modelepository = new PrismaModelRepository(prisma);
            const uuid = new UUIDGenerator();

            return new CreateModelUseCase(modelepository, uuid);
        }   

        const createModelUseCase = makeCreateModelUseCase();

        const model = await createModelUseCase.execute({ name });

        return NextResponse.json(model, { status: 201 });
    } catch (error: unknown) {
        if (error instanceof DomainError) {
            return NextResponse.json(
                { message: error.message },
                { status: mapDomainErrorToStatus(error) }
            );
        }
        return NextResponse.json(
            { message: "Erro interno" },
            { status: 500 }
        );
    }
}

// get all e byName
// retorna uma lista de modelos
export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);

        const name = searchParams.get("name") ?? undefined;

        const modelRepository = new PrismaModelRepository(prisma);
        const findModelsUseCase = new FindModelsUseCase(modelRepository);

        // useCase findMany executando
        const colors = await findModelsUseCase.execute({
            name,
        });

        return NextResponse.json(colors, { status: 200 });

    } catch (error: unknown) {
        if (error instanceof DomainError) {
            return NextResponse.json(
                { message: error.message },
                { status: mapDomainErrorToStatus(error) }
            );
        }

        return NextResponse.json(
            { message: "Erro interno" },
            { status: 500 }
        );
    }
}