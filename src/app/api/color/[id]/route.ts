import { FindColorsUseCase } from "@/src/application/color/usecase/color-find.usecase";
import { DomainError } from "@/src/domain/errors/domain.error";
import { prisma } from "@/src/infrastructure/database/prisma/client";
import { PrismaColorRepository } from "@/src/infrastructure/database/repositories/prisma-color.repository";
import { NextRequest, NextResponse } from "next/server";
import mapDomainErrorToStatus from "../../mapDomainErrorToStatus.error";
import { UpdateColorUseCase } from "@/src/application/color/usecase/color-save.usecase";
import { DeleteColorByIdUseCase } from "@/src/application/color/usecase/color-delete.usecase";

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const colorRepository = new PrismaColorRepository(prisma);
        const findManyUseCase = new FindColorsUseCase(colorRepository);

        const { id } = await params;

        // usecase findmany
        const colors = await findManyUseCase.execute({
            id,
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

// UPDATE BY ID
// passar o id via PARAMS
// 
// uso:
// fetch("http://localhost:3000/api/color/5e7d4fd7-1f78-4b4c-a4d2-1930d2a94e39", {
//   method: "PATCH",
//   headers: {
//     "Content-Type": "application/json",
//   },
//   body: JSON.stringify({
//     name: "Novo Nome",
//   }),
// })
//   .then(res => res.json())
//   .then(console.log)
//   .catch(console.error);
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const body = await req.json();
        const { id } = await params;

        // validação basica
        if (Object.keys(body).length === 0)
            return NextResponse.json(
                { message: "Nenhum dado para atualizar" },
                { status: 400 }
            );

        const updateColorUseCase = new UpdateColorUseCase(new PrismaColorRepository(prisma));

        const color = await updateColorUseCase.execute({
            id,
            name: body.name,
        })

        return NextResponse.json(color, { status: 200 });
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


// delete por id
export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;

        if (!id) {
            return NextResponse.json(
                { message: "Id cannot be empty" },
                { status: 400 }
            );
        }

        const colorRepository = new PrismaColorRepository(prisma);
        const deleteColorUseCase = new DeleteColorByIdUseCase(colorRepository);

        await deleteColorUseCase.execute({ id });

        return NextResponse.json(
            { message: "Cor deletada com sucesso" },
            { status: 200 }
        )

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