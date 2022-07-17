import { DBWhereCause } from "types/MniorDbType";
import type MinorDBInstance from "./MinorDB";
import WhereCause from "./WhereCause";
declare type WhereCauseIntance = InstanceType<typeof WhereCause>;
export declare type MinorTableInstance = InstanceType<typeof Table>;
/**
 * Table类
 * 负责表的增加，删除，修改
 */
export default class Table {
    private minorDb;
    private _name;
    private _pkey;
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
     * @param {string} storeName:表名称
     * @param {object|array} content:需要写入的内容
     */
    insert(rows: any): Promise<unknown>;
    /**
     * 插入一条数据
     * @param {string} storeName:表名称
     * @param {object|array} content:需要写入的内容
     */
    insertOne(row: any): Promise<unknown>;
    /**
     * 更新数据
     * @param {string} storeName:表名称
     * @param {object/array} content:需要写入的内容
     */
    update(doc: any): Promise<unknown>;
    /**
     * 查询数据
     * @param {Object} whereCause  需要查询的条件
     * @param {Object} fields 需要查询的字段信息
     */
    find(whereCause?: DBWhereCause): Promise<unknown>;
    /**
     * 删除数据
     * @param {string} storeName:表名称
     * @param {object/array} content:需要写入的内容
     */
    remove(whereCause?: DBWhereCause): Promise<unknown>;
    /**
     * 清空数据表数据
     */
    clear(): Promise<unknown>;
}
export {};
