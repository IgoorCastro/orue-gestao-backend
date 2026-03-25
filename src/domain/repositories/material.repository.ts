// contrato do repositorio do material do produto
import { Material } from "../entities/material.entity";

export interface MaterialRepository {
    create(material: Material): Promise<void>;
    findById(id: string): Promise<Material | null>;
    findByIds(ids: string[]): Promise<Material[]>; // retorna um array de materiais referente aos ids
    findByName(name: string): Promise<Material[]>;
    findAll(): Promise<Material[]>;
    existsById(id: string): Promise<boolean>; // verifica se existe um material por pesquisa em id no db
    existsByName(name: string): Promise<boolean>; // verifica se existe um material por pesquisa nome no db
    save(material: Material): Promise<void>;
}