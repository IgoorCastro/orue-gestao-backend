// contrato para o repositorio de tamano
import { Size } from "../entities/Size";

export interface SizeRepository {
    save(material: Size): Promise<void>;
    findById(id: string): Promise<Size | null>;
    findBySize(size: string): Promise<Size | null>;
    findAll(): Promise<Size[]>;
}