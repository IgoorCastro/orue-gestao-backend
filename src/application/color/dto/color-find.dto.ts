export type FindColorByNameInputDto = Readonly<{
    name: string,
}>;

export type FindColorByIdInputDto = Readonly<{
    id: string,
}>;

export type FindColorFilteredDto = Readonly<{
    name?: string,
}>

export type FindColorOutputDto = Readonly<{
    id: string,
    name: string,
    createdAt: Date,
    updatedAt: Date,
    deletedAt?: Date,
}>;