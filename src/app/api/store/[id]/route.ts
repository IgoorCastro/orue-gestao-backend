// Rota dinamica com params
// Rota GET -> Pesquisa uma loja via ID
// Rota PATCH -> Atualiza um registro via Id
// Rota DELETE -> Soft delete para loja

import { DomainError } from "@/src/domain/errors/domain.error";
import { NextRequest, NextResponse } from "next/server";
import mapDomainErrorToStatus from "../../mapDomainErrorToStatus.error";
import { FindStoreByIdUseCase } from "@/src/application/store/use-case/store-find-byId.usecase";
import { PrismaStoreRepository } from "@/src/infrastructure/database/repositories/prisma-store.repository";
import { prisma } from "@/src/infrastructure/database/prisma/client";
import { UpdateStoreUseCase } from "@/src/application/store/use-case/store-save.usecase";
import { DeleteStoreByIdUseCase } from "@/src/application/store/use-case/store-delete.usecase";

// Rota GET
export async function GET(_: NextResponse, { params }: { params: Promise<{ id: string }> }) {
    try{
        const { id } = await params;

        const findUseCase = new FindStoreByIdUseCase(new PrismaStoreRepository(prisma));

        const store = await findUseCase.execute({ id });

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

// Rota PATCH
// body esperado: name
export async function PATCH(req: NextResponse, { params }: { params: Promise<{ id: string }> }) {
    try{
        const { id } = await params;
        const body = await req.json();

        const updateUseCase = new UpdateStoreUseCase(new PrismaStoreRepository(prisma));

        const store = await updateUseCase.execute({
            id,
            ...body,
        });

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

// Rota DELETE
// Soft delete em uma loka
export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string}> }) {
    try{
        const { id } = await params;

        const deleteUseCase = new DeleteStoreByIdUseCase(new PrismaStoreRepository(prisma));

        await deleteUseCase.execute({ id });

        return NextResponse.json({ message: "Store deleted", status: 200 });        
    }catch (error: unknown) {
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