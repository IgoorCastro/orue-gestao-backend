import { FindUsersUseCase } from "@/src/application/user/use-case/user-find.usecase";
import { PrismaUserRepository } from "@/src/infrastructure/database/repositories/prisma-user.repository";
import { NextRequest, NextResponse } from "next/server";
import mapDomainErrorToStatus from "../../mapDomainErrorToStatus.error";
import { DomainError } from "@/src/domain/errors/domain.error";
import { prisma } from "@/src/infrastructure/database/prisma/client";
import { DeleteUserByIdUseCase } from "@/src/application/user/use-case/user-delete.usecase";
import { BcryptService } from "@/src/infrastructure/services/bcrypt.service";
import { UpdateUserUseCaseUseCase } from "@/src/application/user/use-case/user-save.usecase";

// get por id via params
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const userRepository = new PrismaUserRepository(prisma);
        const findManyUseCase = new FindUsersUseCase(userRepository);

        const { id } = await params;
        // useCase findMany executando
        const users = await findManyUseCase.execute({
            id: id,
        });

        return NextResponse.json(users, { status: 200 });

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
// fetch("http://localhost:3000/api/user/5e7d4fd7-1f78-4b4c-a4d2-1930d2a94e39", {
//   method: "PATCH",
//   headers: {
//     "Content-Type": "application/json",
//   },
//   body: JSON.stringify({
//     name: "Novo Nome",
//    nickname: "Novo nickname",
//    password: "Novo password",
//    role: Nova Role
//   }),
// })
//   .then(res => res.json())
//   .then(console.log)
//   .catch(console.error);
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const body = await req.json();
        const { id } = await params;

        if (Object.keys(body).length === 0) 
            return NextResponse.json(
                { message: "Nenhum dado para atualizar" },
                { status: 400 }
            );

        console.log("body: ", body);
        console.log("id: ", id)

        function makeUpdateUserUseCase() {
            const userRepository = new PrismaUserRepository(prisma);
            const hash = new BcryptService();

            return new UpdateUserUseCaseUseCase(userRepository, hash);
        }

        const updateUseCase = makeUpdateUserUseCase();

        const user = await updateUseCase.execute({
            id: id,
            ...body
        });

        return NextResponse.json(user, { status: 200 });

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

// DELETE POR ID
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {

        const { id } = await params;

        if (!id) 
            return NextResponse.json(
                { message: "Id cannot be empty" },
                { status: 400 }
            );
        

        function makeDeleteUserUseCase() {
            const userRepository = new PrismaUserRepository(prisma);
            return new DeleteUserByIdUseCase(userRepository);
        }

        const deleteUserUseCase = makeDeleteUserUseCase();

        await deleteUserUseCase.execute({ id });

        return NextResponse.json(
            { message: "Usuário deletado com sucesso" },
            { status: 200 }
        );

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
