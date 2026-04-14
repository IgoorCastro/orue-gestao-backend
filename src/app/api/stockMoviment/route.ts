// API responsavel por tratar das movimentações nos estoques
// Permite o usuario gerar e manipular dados de movimentações
// Rota POST -> cria um novo registro de movimentação no db
// Rota GET -> retorna uma lista de movimentações com filtros

import { DomainError } from "@/src/domain/errors/domain.error";
import { NextRequest, NextResponse } from "next/server";
import mapDomainErrorToStatus from "../mapDomainErrorToStatus.error";
import { CreateStockMovimentUseCase } from "@/src/application/stock-moviment/use-case/stock-moviment-create.usecase";
import { PrismaStockMovimentRepository } from "@/src/infrastructure/database/repositories/prisma-stock-moviment.repository";
import { prisma } from "@/src/infrastructure/database/prisma/client";
import { PrismaStockRepository } from "@/src/infrastructure/database/repositories/prisma-stock.repository";
import { PrismaUserRepository } from "@/src/infrastructure/database/repositories/prisma-user.repository";
import { UUIDGenerator } from "@/src/infrastructure/services/uuid-generator";
import { PrismaProductStockRepository } from "@/src/infrastructure/database/repositories/prisma-product-stock.repository";
import { FindStockMovimentByIdUseCase } from "@/src/application/stock-moviment/use-case/stock-moviment-find-byId.usecase";
import { StockMovimentFilterMapper } from "@/src/application/mappers/stock-moviment-filter.mapper";
import { FindStockMovimentsUseCase } from "@/src/application/stock-moviment/use-case/stock-moviment-find.usecase";
import { StockMoviment } from "@/src/domain/entities/stock-moviment.entity";
import { FindStockMovimentOutputDto } from "@/src/application/stock-moviment/dto/stock-moviment-find.dto";

// Rota POST
// body esperado: type, unitPrice, totalPrice, quantity, fromStockId, toStockId, productStockId, userId
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();

        function makeCreateUseCase() {
            const stockMovimentRepository = new PrismaStockMovimentRepository(prisma);
            const stockRepository = new PrismaStockRepository(prisma)
            const userRepository = new PrismaUserRepository(prisma);
            const productStockRepository = new PrismaProductStockRepository(prisma);
            const uuid = new UUIDGenerator();

            return new CreateStockMovimentUseCase(stockMovimentRepository, stockRepository, productStockRepository, userRepository, uuid);
        }

        const createUseCase = makeCreateUseCase();
        // console.log("SM: ", body)

        const sm = await createUseCase.execute({
            ...body,
        });

        return NextResponse.json(sm, { status: 200 });
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

// Rota GET com params
// usar para pesquisa com filtros
// filtros: type, quantity, fromStockId, toStockId, productStockId, userId
// preço (minimo e maximo)
// limit: limite de dados retornados na query
// page: pagina do array retornada (array de 10 produtos, com limit = 5 possui duas pages (5 + 5))
// orderBy: ordena em ordem crescente ou decrescente os campos [name, price e createdAt] / uso: api/product?name=Calça&orderBy=name:desc&
export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);

        const type = searchParams.get("type") ?? undefined;
        const quantity = searchParams.get("quantity") ?? undefined;
        const fromStockId = searchParams.get("fromStockId") ?? undefined;
        const toStockId = searchParams.get("toStockId") ?? undefined;
        const productStockId = searchParams.get("productStockId") ?? undefined;
        const userId = searchParams.get("user") ?? undefined;
        const priceGte = parseNumber(searchParams.get("price_gte"));
        const priceLte = parseNumber(searchParams.get("price_lte"));
        const createdAtGte = searchParams.get("fromDate") ?? undefined; // MIN
        const createdAtLte = searchParams.get("toDate") ?? undefined; // MAX

        const limitParam = searchParams.get("limit") ?? undefined;
        const pageParam = searchParams.get("page") ?? undefined;
        const orderBy = searchParams.get("orderBy") ?? undefined;

        // map para paginação
        const page = pageParam ? Number(pageParam) : undefined;
        const limit = limitParam ? Number(limitParam) : undefined;

        // mapeamento dos params
        function makeFilterMap() {
            const stockRep = new PrismaStockRepository(prisma);

            // return new StockMovimentFilterMapper(stockRep);
            return new StockMovimentFilterMapper();
        }
        const filterMapper = makeFilterMap();
        const filter = await filterMapper.map({
            createdAtGte,
            createdAtLte,
            fromStockId,
            limit,
            orderBy,
            page,
            priceGte,
            priceLte,
            productStockId,
            quantity,
            toStockId,
            type,
            userId,
        });


        const findUseCase = new FindStockMovimentsUseCase(new PrismaStockMovimentRepository(prisma));

        const sm = await findUseCase.execute(filter);

        return NextResponse.json(sm, { status: 200 });
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

    // map para numeros
    function parseNumber(value: string | null) {
        if (!value) return undefined;
        const num = Number(value);
        return isNaN(num) ? undefined : num;
    }  
}