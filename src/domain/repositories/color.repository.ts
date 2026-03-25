// contrato do repositorio de cores
import { Color } from "../entities/color.entity";

export interface ColorRepository {
    create(color: Color): Promise<void>;
    findById(id: string): Promise<Color | null>;
    findByIds(ids: string[]): Promise<Color[]>;
    findByName(name: string): Promise<Color[]>;
    existsByName(name: string): Promise<boolean>;
    findAll(): Promise<Color[]>;
    save(color: Color): Promise<void>;
}