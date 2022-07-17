export interface DBSchemas extends Record<string, string> {
}
export interface DBConfig {
    name: string;
    version: number;
    schemas: DBSchemas;
}
export interface DBWhereCause {
    count?: Number;
    keyRange?: IDBValidKey | IDBKeyRange;
    orderBy?: IDBCursorDirection;
}