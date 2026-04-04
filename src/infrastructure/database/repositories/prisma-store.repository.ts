import { PrismaClient, Prisma, Store as PrismaStore } from "@/generated/prisma/client";
import { Store } from "@/src/domain/entities/store.entity";
import { StoreRepository } from "@/src/domain/repositories/store.repository";
import normalizeName from "@/src/domain/utils/normalize-name";

export class PrismaStoreRepository implements StoreRepository {
    constructor(private readonly prisma: PrismaClient) { }

    async findById(id: string): Promise<Store | null> {
        const store = await this.prisma.store.findUnique({
            where: { id },
        })

        if(!store) return null;

        return this.toDomain(store);
    }

    async findByName(name: string): Promise<Store[]> {
        const store = await this.prisma.store.findMany({
            where: { 
                name: {
                    contains: name,
                    mode: "insensitive",
                }
             }
        });

        return store.map(this.toDomain);
    }

    async findAll(): Promise<Store[]> {
        const store = await this.prisma.store.findMany({
            where: { deletedAt: null }
        });

        return store.map(this.toDomain);
    }

    async findMany(filters: { name?: string; }): Promise<Store[]> {
        console.log("FILTERS: ", filters)
        const stores = await this.prisma.store.findMany({
            where: {
                name: filters.name
                    ? normalizeName(filters.name)
                    : undefined,
            }
        })

        return stores.map(s => this.toDomain(s));
    }

    async save(store: Store): Promise<void> {
        await this.prisma.store.upsert({
            where: { id: store.id },
            update: this.toPrismaUpdate(store),
            create: this.toPrismaCreate(store),
        })
    }

    // =========================
    // MAPPERS
    // =========================

    private toDomain(prismaStore: PrismaStore): Store {
        return Store.restore({
            id: prismaStore.id,
            name: prismaStore.name,
            createdAt: prismaStore.createdAt,
            updatedAt: prismaStore.updatedAt,
            deletedAt: prismaStore.deletedAt ?? undefined,
        });
    }

    private toPrismaUpdate(store: Store): Prisma.StoreUpdateInput {
        return {
            name: store.name,
            updatedAt: store.updatedAt,
            deletedAt: store.deletedAt ?? null,
        };
    }

    private toPrismaCreate(store: Store): Prisma.StoreCreateInput {
        return {
            id: store.id,
            name: store.name,
        };
    }
}

