import { isObject, getIDBError, logError, IDBKeyRange } from "./util";
import WhereCause from "./WhereCause";

/**
 * Table类
 * 负责表的增加，删除，修改
 */
export default class Table {

    constructor(minorDb, name) {
        this.minorDb = minorDb;
        this._name = name;
        this._bind();
    }

    get idb() {
        return this.minorDb._idb;
    }

    /**
  * 根据schema配置信息创建table
  * @param {String} schema 数据库字段
  */
    create(schema) {
        const fields = schema.split(',');
        /**
         * 取fields第一个为主键
         * ++代表主键自增
         */
        const _pkey = fields[0].trim();
        const autoIncrement = _pkey.startsWith("++");
        this._pkey = autoIncrement ? _pkey.slice(2) : _pkey;
        const opition = { keyPath: this._pkey, autoIncrement };
        const _table = this.idb.createObjectStore(this._name, opition);

        /**
         * 遍历字段的schema配置信息，创建索引
         * &代表unique不可重复索引
         */
        if (fields.length <= 1) return;
        for (let i = 1; i < fields.length; i++) {
            const field = fields[i].trim();
            const unique = field.startsWith("&");
            const _field = unique ? field.slice(1) : field;
            _table.createIndex(_field, _field, { unique });
        }
    }

    /**
     * 获取store的实例
     * 默认开启 transaction事物
     * @param {String} rwType 
     * @returns objectStore
     */
    getStore(rwType) {
        return this.idb.transaction([this._name], rwType).objectStore(this._name);
    }

    _bind() {
        ['where', 'limit', 'sort'].forEach(func => {
            this[func] = (...arg) => new WhereCause(this)[func](...arg);
        });
    }


    /**
     * 插入数据，可以一条或多条
     * @param {string} storeName:表名称
     * @param {object|array} content:需要写入的内容
     */
    insert(rows) {
        if (!isObject(rows)) logError('content must be is an object or array ');
        //如果是数组
        if (Array.isArray(rows)) {
            return Promise.all(rows.map((row) => {
                return this.insertOne(row);
            }));
        } else {
            return this.insertOne(rows);
        }
    }

    /**
     * 插入一条数据
     * @param {string} storeName:表名称
     * @param {object|array} content:需要写入的内容
     */
    insertOne(row) {
        if (!isObject(row) || Array.isArray(row)) logError('content must be is an object');
        return new Promise((resolve, reject) => {
            const store = this.getStore("readwrite");
            const iRequest = store.add(row);
            iRequest.onsuccess = () => {
                resolve(iRequest.result);
            };
            iRequest.onerror = (event) => reject(getIDBError(event));
        });
    }

    /**
     * 更新数据
     * @param {string} storeName:表名称
     * @param {object/array} content:需要写入的内容
     */
    update(doc) {
        if (!isObject(doc) || Array.isArray(doc)) logError('content must be is an object');
        return new Promise((resolve, reject) => {
            const store = this.getStore("readwrite");
            if (!doc[store.keyPath]) reject('content must have a primary key');
            const uRequest = store.put(doc);
            uRequest.onsuccess = () => resolve(uRequest.result);
            uRequest.onerror = (event) => reject(getIDBError(event));
        });
    }

    /**
     * 查询数据
     * @param {Object} whereCause  需要查询的条件
     * @param {Object} fields 需要查询的字段信息
     */
    find(fields, whereCause = {}) {
        const { count, keyRange, orderBy } = whereCause;
        return new Promise((resolve, reject) => {
            const store = this.getStore("readonly");
            const list = [];
            const qRequest = store.openCursor(keyRange, orderBy);
            qRequest.onsuccess = (event) => {
                const cursor = event.target.result;
                if (cursor) {
                    list.push(cursor.value);
                    if (count && list.length >= count) {
                        resolve(list);
                        return;
                    }
                    cursor.continue();
                } else {
                    resolve(list);
                }
            };
            qRequest.onerror = (event) => reject(getIDBError(event));
        });
    }


    /**
     * 删除数据
     * @param {string} storeName:表名称
     * @param {object/array} content:需要写入的内容
     */
    remove(whereCause = {}) {
        if (!isObject(whereCause) || Array.isArray(whereCause)) logError('whereCause must be an object ');
        const { count, keyRange, orderBy } = whereCause;
        return new Promise((resolve, reject) => {
            const store = this.getStore("readwrite");
            console.log(store);
            const dRequest = store.openCursor(keyRange, orderBy);
            const list = [];
            dRequest.onsuccess = (event) => {
                const cursor = event.target.result;
                if (cursor) {
                    if (count && list.length >= count) {
                        resolve(list);
                        return;
                    }
                    cursor.delete();
                    list.push(cursor.value);
                    cursor.continue();
                } else {
                    resolve(list);
                }
            };
            dRequest.onerror = (event) => reject(getIDBError(event));
        });
    }


    /**
     * 清空数据表数据
     */
    clear() {
        return new Promise((resolve, reject) => {
            const cRequest = this.getStore("readwrite").clear();
            cRequest.onsuccess = () => resolve(cRequest.result);
            cRequest.onerror = (event) => reject(getIDBError(event));
        });
    }
}
