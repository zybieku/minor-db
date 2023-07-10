import { DBSchemas } from "types/MniorDbType";
import Table from "./Table";

import { indexedDB, getIDBError, isObject } from "./util";

export type MinorDBInstance = InstanceType<typeof MinorDB>

/**
 * MinorDB是基于IndexDB封装的一个浏览器数据库
 */
export default class MinorDB {
    private _name: string;
    private _version: number;
    private _isOpen: boolean = false;
    private request?: IDBOpenDBRequest;
    public _idb?: IDBDatabase;
    private upgradeFunc;

    constructor(name: string, version: number) {
        this._name = name;
        this._version = version || 1;
        return this
    }

    /**
     * 数据的名字.
     * @type {string}
     */
    get name() {
        return this._name;
    }

    /**
     * 数据库的版本
     * @type {number}
     */
    get version() {
        return this._version;
    }

    /**
     * 是否打开
     */
    get isOpen() {
        return this._isOpen;
    }

    /**
     * 监听的onupgradeneeded的触发函数
     * @param {Function} cb  onupgradeneeded 回调
     */
    onupgradeneeded(cb) {
        this.upgradeFunc = cb;
    }

    /**
     * 创建并打开数据库，如果已经创建过了，即直接打开
     * @param {Object}
     * @returns Promise
     */
    open(schemas: DBSchemas) {
        this.close();
        this._stores(schemas);
        return new Promise((resolve, reject) => {
            this.request = indexedDB.open(this._name, this._version);

            this.request.onupgradeneeded = (event: any) => {
                this._idb = event.target.result as IDBDatabase;
                this._addStores(schemas);
                this.upgradeFunc && this.upgradeFunc(event);
                console.log('onupgradeneeded');
            };

            this.request.onsuccess = (event: any) => {
                this._idb = event.target.result as IDBDatabase;
                this._isOpen = true;
                resolve(event);
            };
            this.request.onerror = (event) => reject(getIDBError(event));
        });
    }

    _addStores(schemas: DBSchemas) {
        for (const tbName of Object.keys(schemas)) {
            if (!this._idb!.objectStoreNames.contains(tbName)) {
                this[tbName].create(schemas[tbName]);
            }
        }
    }

    /**
     * 根据schemas创建table
     * @param {Object} schemas table的配置文件
     * @returns MinorDB
     */
    _stores(schemas: DBSchemas) {
        if (!isObject(schemas)) {
            throw new Error("schemas required an  Object");
        }
        for (const tbName of Object.keys(schemas)) {
            if (this[tbName]) break;
            this[tbName] = new Table(this, tbName);
        }
        return this;
    }

    /**
     * 获取所有的table名字
     * @returns Array
     */
    getTableNames() {
        return this._idb && this._idb.objectStoreNames;
    }

    /**
     * 关闭数据库
     */
    close() {
        if (this._isOpen) {
            this._idb?.close();
            this._isOpen = false;
            this._idb = undefined;
        }
    }

    /**
     * 销毁数据库
     */
    drop() {
        this.close();
        return new Promise((resolve, reject) => {
            const req = indexedDB.deleteDatabase(this._name);
            req.onsuccess = (e) => resolve(e);
            req.onerror = (e) => reject(e);
        });
    }
}
