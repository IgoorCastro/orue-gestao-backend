// import { PrismaClient, Size as PrismaSize, ProductSize as PrismaProductSize, Prisma } from "@/generated/prisma/client";
// import { Size } from "@/src/domain/entities/size.entity";
// import { ProductSize } from "@/src/domain/enums/product-size.enum";
// import { UserRepository } from "@/src/domain/repositories/user.repository";

// export class PrismaSizeRepository {


//     // =========================
//     // 🔁 MAPPERS
//     // =========================

//     private toDomain(prismaSize: PrismaSize): Size {
//         return new Size({
//             id: prismaSize.id,
//             size: this.mapRoleToDomain(prismaSize.size),
//         });
//     }

//     private toPrismaUpdate(size: Size): Prisma.SizeUpdateInput {
//         return {
//             size: size.size as PrismaProductSize,
//         };
//     }

//     private toPrismaCreate(store: Store): Prisma.StoreCreateInput {
//         return {
//             id: store.id,
//             name: store.name,
//         };
//     }

//     // converte type do prisma para o enum do sistema
//     private mapRoleToDomain(role: PrismaProductSize): ProductSize {
//         return role as ProductSize;
//     }
// }

