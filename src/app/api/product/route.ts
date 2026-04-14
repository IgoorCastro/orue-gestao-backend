// rota: endereço/product
// metodos: GET All, POST

import { CreateProductUseCase } from "@/src/application/product/use-case/product-create.usecase";
import { DomainError } from "@/src/domain/errors/domain.error";
import { DefaultSkuGenerator } from "@/src/domain/services/default-sku-generator";
import { prisma } from "@/src/infrastructure/database/prisma/client";
import { PrismaColorRepository } from "@/src/infrastructure/database/repositories/prisma-color.repository";
import { PrismaMaterialRepository } from "@/src/infrastructure/database/repositories/prisma-material.repository";
import { PrismaModelRepository } from "@/src/infrastructure/database/repositories/prisma-model.repository";
import { PrismaProductRepository } from "@/src/infrastructure/database/repositories/prisma-product.repository";
import { PrismaBarcodeGeneratorService } from "@/src/infrastructure/services/prisma-barcode-generator.service";
import { UUIDGenerator } from "@/src/infrastructure/services/uuid-generator";
import { NextRequest, NextResponse } from "next/server";
import mapDomainErrorToStatus from "../mapDomainErrorToStatus.error";
import { FindProductsUseCase } from "@/src/application/product/use-case/product-find.usecase";
import { ProductFilterMapper } from "@/src/application/mappers/product-filter.mapper";
import { ProductSize } from "@/src/domain/enums/product-size.enum";
import { ProductType } from "@/src/domain/enums/product-type.enum";

// cria um novo produto
// registrar as relações aqui
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();

        // body esperado:  id, name, price, type, size, modelId, mlProductId, barcode
        const { name, price, type, size, modelId, mlProductId, colorIds, materialIds } = body;

        function makeCreateProductUseCase() {
            const productRepository = new PrismaProductRepository(prisma);
            const colorRepository = new PrismaColorRepository(prisma);
            const materialRepository = new PrismaMaterialRepository(prisma);
            const modelRepository = new PrismaModelRepository(prisma);
            const uuidService = new UUIDGenerator();
            const skuService = new DefaultSkuGenerator();
            const barcodeService = new PrismaBarcodeGeneratorService(prisma);


            return new CreateProductUseCase(productRepository, colorRepository, materialRepository, modelRepository, uuidService, skuService, barcodeService);
        }

        const createProductUseCase = makeCreateProductUseCase();

        const product = await createProductUseCase.execute({
            name: name,
            price: price,
            type: type,
            size: size,
            colorIds: colorIds,
            materialIds: materialIds,
            modelId: modelId,
            mlProductId: mlProductId,
        })

        return NextResponse.json(product, { status: 201 });
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

// GET com params
// usar para pesquisa com filtros
// filtros: name (normalizedName), price (desenvolver com filtro)
// size, type, preço (minimo e maximo), model, mlProductId, barcode, type
// limit: limite de dados retornados na query
// page: pagina do array retornada (array de 10 produtos, com limit = 5 possui duas pages (5 + 5))
// orderBy: ordena em ordem crescente ou decrescente os campos [name, price e createdAt] / uso: api/product?name=Calça&orderBy=name:desc&

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);

        // parametros unicos
        // filtra apenas uma string por vez
        // filtros que aceitam ordenação: name, preço e data de criação
        const name = searchParams.get("name") ?? undefined;
        const mlProductId = searchParams.get("mlProductId") ?? undefined;
        const barcode = searchParams.get("barcode") ?? undefined;
        const size = searchParams.get("size") ?? undefined;
        const type = searchParams.get("type") ?? undefined;
        // trabalhar com min e max price
        // para criar um rage de preços para pesquisa
        const minPrice = searchParams.get("minPrice") ?? undefined;
        const maxPrice = searchParams.get("maxPrice") ?? undefined;
        const limitParam = searchParams.get("limit");
        const pageParam = searchParams.get("page");
        const orderBy = searchParams.get("orderBy") ?? undefined;
        // multiplos parametros
        // filtra com uma ou mais strings
        const models = searchParams.getAll("models");
        const colors = searchParams.getAll("colors[]");
        const materials = searchParams.getAll("materials");

        function makeFilterMap() {
            const colorRep = new PrismaColorRepository(prisma);
            const materialRep = new PrismaMaterialRepository(prisma);
            const modelRep = new PrismaModelRepository(prisma);

            return new ProductFilterMapper(colorRep, materialRep, modelRep);
        }


        const page = pageParam ? Number(pageParam) : undefined;
        const limit = limitParam ? Number(limitParam) : undefined;

        const filterMapper = makeFilterMap();
        const filter = await filterMapper.map({
            name,
            maxPrice,
            minPrice,
            colors,
            materials,
            models,
            size: size as ProductSize,
            orderBy,
            barcode,
            mlProductId,
            page: Number(page),
            limit: Number(limit),
            type: type as ProductType,
        })

        
        // console.log("FILTERSSS: ", filter)
        
        const findWithFilter = new FindProductsUseCase(new PrismaProductRepository(prisma));

        const product = await findWithFilter.execute(filter);

        console.log("product: ", product)

        return NextResponse.json(product, { status: 200 });
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

    function parseNumber(value: string | null) {
        if (!value) return undefined;
        const num = Number(value);
        return isNaN(num) ? undefined : num;
    }
}