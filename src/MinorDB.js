import Table from './Table';

import { indexedDB, getIDBError, isObject } from './util';

/**
 * MinorDB是基于IndexDB封装的一个浏览器数据库
 */
export default class MinorDB {

    constructor(name, version) {
        this._name = name;
        this._version = version || 1;
    }

    /**
     * 数据的名字.
     * @type {string}
     */
    get name() { return this._name; }

    /**
     * 数据库的版本
     * @type {number}
     */
    get version() { return this._version; }


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
    open(schemas) {
        this.close();
        this._stores(schemas);
        return new Promise((resolve, reject) => {

            this.request = indexedDB.open(this._name, this._version);

            this.request.onupgradeneeded = (event) => {
                this._idb = event.target.result;
                this._addStores(schemas);
                this.upgradeFunc && this.upgradeFunc(event);
            };

            this.request.onsuccess = (event) => {
                this._idb = event.target.result;
                this._isOpen = true;
                resolve(event);
            };
            this.request.onerror = (event) => reject(getIDBError(event));
        });
    }

    _addStores(schemas) {
        for (const tbName of Object.keys(schemas)) {
            if (!this._idb.objectStoreNames.contains(tbName)) {
                this[tbName].create(schemas[tbName]);
            }
        }
    }

    /**
     * 根据schemas创建table
     * @param {Object} schemas table的配置文件
     * @returns MinorDB
     */
    _stores(schemas) {
        if (!isObject(schemas)) { throw new Error('schemas required an  Object'); }
        for (const tbName of Object.keys(schemas)) {
            if (this[tbName]) break;
            this[tbName] = new Table(this, tbName, schemas[tbName]);
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
            this._idb.close();
            this._isOpen = false;
            this._idb = null;
        }
    }

    /**
     * 销毁数据库
     */
    drop() {
        this.close();
        return new Promise((resolve, reject) => {
            const req = indexedDB.deleteDatabase(this._name);
            req.onsuccess = () => resolve();
            req.onerror = e => reject(e);
        });
    }

}
