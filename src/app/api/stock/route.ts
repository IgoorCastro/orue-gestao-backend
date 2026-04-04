// API responsavel por tratar o estoque
// Permite o usuario criar e manipular dados de estoque
// Rota POST -> cria um novo registro de estoque no db
// Rota GET -> retorna uma lista de estoques

import { DomainError } from "@/src/domain/errors/domain.error";
import { NextRequest, NextResponse } from "next/server";
import mapDomainErrorToStatus from "../mapDomainErrorToStatus.error";
import { CreateStockUseCase } from "@/src/application/stock/use-case/stock-create.usecase";
import { PrismaStockRepository } from "@/src/infrastructure/database/repositories/prisma-stock.repository";
import { prisma } from "@/src/infrastructure/database/prisma/client";
import { UUIDGenerator } from "@/src/infrastructure/services/uuid-generator";
import { FindStocksUseCase } from "@/src/application/stock/use-case/stock-find.usecase";
import { StockType } from "@/src/domain/enums/stock-type.enum";
import { PrismaStoreRepository } from "@/src/infrastructure/database/repositories/prisma-store.repository";

// Rota POST
// body esperado: name, type e storeId
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();

        const { name, type, storeId } = body;

        function makeCreateUseCase() {
            const stockRepository = new PrismaStockRepository(prisma)
            const uuid = new UUIDGenerator();
            const storeRepository = new PrismaStoreRepository(prisma);
            return new CreateStockUseCase(stockRepository, storeRepository, uuid);
        }
        
        const createUseCase = makeCreateUseCase();

        const stock = await createUseCase.execute({
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

// Rota GET
// Get com params via URL
// usar para pesquisa com filtros
// filtros: name, type storeId
//
export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);

        const name = searchParams.get("name") ?? undefined;
        const inputType = searchParams.get("type") ?? undefined;
        const storeId = searchParams.get("storeId") ?? undefined;
        // mapeamento do type
        const allowedTypes = Object.keys(StockType);
        const type = allowedTypes.includes(inputType as StockType)
            ? inputType as StockType
            : undefined;

        const findUseCase = new FindStocksUseCase(new PrismaStockRepository(prisma));
        const stocks = await findUseCase.execute({
            name,
            type: type,
            storeId
        })

        return NextResponse.json(stocks, { status: 200 });
    } catch (error: unknown) {
        if (error instanceof DomainError) {
            return NextResponse.json(
                { message: error.message, status: mapDomainErrorToStatus(error) }
            );
        }
        return NextResponse.json(
            { message: "Erro interno", status: 500 }
        );
    }
}