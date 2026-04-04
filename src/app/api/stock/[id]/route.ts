// Rota dinamica com params
// Rota GET -> Pesquisa um estoque via ID
// Rota PATCH -> Atualiza um registro via Id
// Rota DELETE -> Soft delete para estoque

import { DomainError } from "@/src/domain/errors/domain.error";
import { NextRequest, NextResponse } from "next/server";
import mapDomainErrorToStatus from "../../mapDomainErrorToStatus.error";
import { FindStockByIdUseCase } from "@/src/application/stock/use-case/stock-find-byId.usecase";
import { PrismaStockRepository } from "@/src/infrastructure/database/repositories/prisma-stock.repository";
import { prisma } from "@/src/infrastructure/database/prisma/client";
import { UpdateStockUseCase } from "@/src/application/stock/use-case/stock-save.usecase";
import { PrismaStoreRepository } from "@/src/infrastructure/database/repositories/prisma-store.repository";
import { DeleteStockByIdUseCase } from "@/src/application/stock/use-case/stock-delete.usecase";

// Rota GET
export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;

        const findUseCase = new FindStockByIdUseCase(new PrismaStockRepository(prisma));

        const stock = await findUseCase.execute({ id });

        return NextResponse.json(stock, { status: 200 });
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

// Rota PATCH
// body permitido: name, stockId e type 
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const body = await req.json();

        function makeUpdateUseCase(): UpdateStockUseCase {
            const stockRepository = new PrismaStockRepository(prisma);
            const storeRepository = new PrismaStoreRepository(prisma);

            return new UpdateStockUseCase(stockRepository, storeRepository)
        }

        const updateUseCase = makeUpdateUseCase();

        const stock = await updateUseCase.execute({
            id,
            ...body,
        });

        return NextResponse.json(stock, { status: 200 });
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

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;

        const deleteUseCase = new DeleteStockByIdUseCase(new PrismaStockRepository(prisma));
        await deleteUseCase.execute({ id });

        return NextResponse.json({ message: "Stock deleted", status: 200 })
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