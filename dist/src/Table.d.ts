import { DBWhereCause } from "types/MniorDbType";
import type MinorDBInstance from "./MinorDB";
import WhereCause from "./WhereCause";
export declare type MinorTableInstance = InstanceType<typeof Table>;
declare type WhereCauseIntance = InstanceType<typeof WhereCause>;
export declare type UpdateData = Array<Record<string, any>> | Record<string, any>;
/**
 * Table类
 * 负责表的增加，删除，修改
 */
export default class Table {
    private minorDb;
    private _name;
    _pkey: string;
    where: (arg: DBWhereCause) => WhereCauseIntance;
    limit: (arg: number) => WhereCauseIntance;
    sort: (arg: 'ASC' | 'DESC') => WhereCauseIntance;
    constructor(minorDb: MinorDBInstance, name: string);
    get idb(): IDBDatabase;
    /**
    * 根据schema配置信息创建table
    * @param {String} schema 数据库字段
    */
    create(schema: any): void;
    /**
     * 获取store的实例
     * 默认开启 transaction事物
     * @param {String} rwType
     * @returns objectStore
     */
    getStore(rwType: any): IDBObjectStore;
    /**
     * 插入数据，可以一条或多条
     * @param {object|array} content:需要写入的内容
     */
    insert(rows: any): Promise<unknown>;
    /**
     * 插入一条数据
     * @param {object} content:需要写入的内容
     */
    insertOne(row: any, store?: IDBObjectStore): Promise<unknown>;
    /**
     * 更新数据
     * @param {UpdateData} doc 需要写入的内容
     */
    update(doc: UpdateData): Promise<unknown>;
    /**
     * 查询数据
     * @param {DBWhereCause} whereCause  需要查询的条件
     */
    find(whereCause?: DBWhereCause): Promise<unknown>;
    /**
     * 删除数据
     * @param {DBWhereCause} whereCause  需要删除的条件
     */
    remove(whereCause?: DBWhereCause): Promise<unknown>;
    /**
     * 清空数据表数据
     */
    clear(): Promise<unknown>;
}
export {};
