// API responsavel por tratar lojas
// Permite o usuario criar e manipular dados de lojas
// Rota POST -> cria um novo registro de loja no db
// Rota GET -> retorna uma lista de loja

import { DomainError } from "@/src/domain/errors/domain.error";
import { NextRequest, NextResponse } from "next/server";
import mapDomainErrorToStatus from "../mapDomainErrorToStatus.error";
import { CreateStoreUseCase } from "@/src/application/store/use-case/store-create.usecase";
import { PrismaStoreRepository } from "@/src/infrastructure/database/repositories/prisma-store.repository";
import { prisma } from "@/src/infrastructure/database/prisma/client";
import { UUIDGenerator } from "@/src/infrastructure/services/uuid-generator";
import { FindStoresUseCase } from "@/src/application/store/use-case/store-find.usecase";

// Rota POST
// body esperado: name
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();

        function makeCreateUseCase() {
            const storeRepository = new PrismaStoreRepository(prisma);
            const uuid = new UUIDGenerator();
            return new CreateStoreUseCase(storeRepository, uuid)
        }

        const createUseCase = makeCreateUseCase();

        const store = await createUseCase.execute({ name: body.name });

        return NextResponse.json(store, { status: 200 });
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

// Rota GET
// retorna uma lista com todas as lojas registradas
// aceita tbm filtros como params
export async function GET(req: NextRequest) {
    try{
        const { searchParams } = new URL(req.url);

        const name = searchParams.get("name") ?? undefined;

        const findUseCase = new FindStoresUseCase(new PrismaStoreRepository(prisma));

        const stores = await findUseCase.execute({
            name,
        })

        return NextResponse.json(stores, { status: 200 });
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