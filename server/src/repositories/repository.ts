export interface Entity { id: string }

export interface Repository<T extends Entity> {
  findAll(): Promise<T[]>;
  findById(id: string): Promise<T | undefined>;
  create(item: T): Promise<T>;
  update(id: string, changes: Partial<T>): Promise<T>;
  delete(id: string): Promise<T>;
}
