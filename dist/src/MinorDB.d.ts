import { DBSchemas } from "types/MniorDbType";
import { MinorTableInstance } from "./Table";
export declare type MinorDBInstance = InstanceType<typeof MinorDB>;
export declare type tableNameKey = keyof DBSchemas;
/**
 * MinorDB是基于IndexDB封装的一个浏览器数据库
 */
export default class MinorDB {
    private _name;
    private _version;
    private _isOpen;
    private request?;
    _idb?: IDBDatabase;
    private upgradeFunc;
    [key: tableNameKey]: MinorTableInstance | any;
    constructor(name: string, version: number);
    /**
     * 数据的名字.
     * @type {string}
     */
    get name(): string;
    /**
     * 数据库的版本
     * @type {number}
     */
    get version(): number;
    /**
     * 监听的onupgradeneeded的触发函数
     * @param {Function} cb  onupgradeneeded 回调
     */
    onupgradeneeded(cb: any): void;
    /**
     * 创建并打开数据库，如果已经创建过了，即直接打开
     * @param {Object}
     * @returns Promise
     */
    open(schemas: DBSchemas): Promise<unknown>;
    _addStores(schemas: DBSchemas): void;
    /**
     * 根据schemas创建table
     * @param {Object} schemas table的配置文件
     * @returns MinorDB
     */
    _stores(schemas: DBSchemas): this;
    /**
     * 获取所有的table名字
     * @returns Array
     */
    getTableNames(): DOMStringList | undefined;
    /**
     * 关闭数据库
     */
    close(): void;
    /**
     * 销毁数据库
     */
    drop(): Promise<unknown>;
}
