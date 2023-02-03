export declare const isObject: (obj: any) => obj is Record<any, any>;
export declare const getIDBError: (e: any) => any;
export declare const logError: (e: any) => never;
export declare const logTypeError: (e: any) => never;
export declare const indexedDB: IDBFactory;
export declare const IDBKeyRange: {
    new (): IDBKeyRange;
    prototype: IDBKeyRange;
    bound(lower: any, upper: any, lowerOpen?: boolean | undefined, upperOpen?: boolean | undefined): IDBKeyRange;
    lowerBound(lower: any, open?: boolean | undefined): IDBKeyRange;
    only(value: any): IDBKeyRange;
    upperBound(upper: any, open?: boolean | undefined): IDBKeyRange;
};
