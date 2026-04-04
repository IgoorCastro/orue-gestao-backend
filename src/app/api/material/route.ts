import { DomainError } from "@/src/domain/errors/domain.error";
import { prisma } from "@/src/infrastructure/database/prisma/client";
import { UUIDGenerator } from "@/src/infrastructure/services/uuid-generator";
import { NextRequest, NextResponse } from "next/server";
import mapDomainErrorToStatus from "../mapDomainErrorToStatus.error";
import { PrismaMaterialRepository } from "@/src/infrastructure/database/repositories/prisma-material.repository";
import { FindMaterialsUseCase } from "@/src/application/meterial/usecase/material-find.usecase";
import { CreateMaterialUseCase } from "@/src/application/meterial/usecase/material-create.usecase";

// Rota para criação de um novo material
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();

        // body esperado para novo material
        const { name } = body;

        function makeCreateMaterialUseCase() {
            const materialRepository = new PrismaMaterialRepository(prisma);
            const uuid = new UUIDGenerator();

            return new CreateMaterialUseCase(materialRepository, uuid);
        }   

        const createMaterialUseCase = makeCreateMaterialUseCase();

        const material = await createMaterialUseCase.execute({ name });

        return NextResponse.json(material, { status: 201 });
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
// retorna uma lista de materiais
export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);

        const name = searchParams.get("name") ?? undefined;

        const materialRepository = new PrismaMaterialRepository(prisma);
        const findMaterialsUseCase = new FindMaterialsUseCase(materialRepository);

        // useCase findMany executando
        const colors = await findMaterialsUseCase.execute({
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