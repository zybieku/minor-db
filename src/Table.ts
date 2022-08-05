import { DBWhereCause } from "types/MniorDbType";
import type MinorDBInstance from "./MinorDB";
import { isObject, getIDBError, logError, IDBKeyRange, logTypeError } from "./util";
import WhereCause from "./WhereCause";

export type MinorTableInstance = InstanceType<typeof Table>;

type WhereCauseIntance = InstanceType<typeof WhereCause>

export type UpdateData = Array<Record<string, any>> | Record<string, any>

/**
 * Table类
 * 负责表的增加，删除，修改
 */
export default class Table {
    private minorDb: MinorDBInstance
    private _name: string
    public _pkey: string = ''
    public where: (arg: DBWhereCause) => WhereCauseIntance
    public limit: (arg: number) => WhereCauseIntance
    public sort: (arg: 'ASC' | 'DESC') => WhereCauseIntance

    constructor(minorDb: MinorDBInstance, name: string) {
        this.minorDb = minorDb;
        this._name = name;
        this.where = (arg) => new WhereCause(this).where(arg)
        this.limit = (arg) => new WhereCause(this).limit(arg)
        this.sort = (arg) => new WhereCause(this).sort(arg)
    }

    get idb() {
        return this.minorDb._idb!;
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
        if (!this.minorDb.isOpen) {
            logError('the indexdb is not open')
        }
        return this.idb?.transaction([this._name], rwType).objectStore(this._name);
    }

    // _bind() {
    //     ['where', 'limit', 'sort'].forEach(func => {
    //         this[func] = (...arg) => new WhereCause(this)[func](...arg);
    //     });
    // }


    /**
     * 插入数据，可以一条或多条
     * @param {object|array} content:需要写入的内容
     */
    insert(rows) {
        if (!isObject(rows)) logTypeError('content must be is an object or array ');
        const store = this.getStore("readwrite");
        //如果是数组
        if (Array.isArray(rows)) {
            return Promise.all(rows.map((row) => {
                return this.insertOne(row, store);
            }));
        } else {
            return this.insertOne(rows, store);
        }
    }

    /**
     * 插入一条数据
     * @param {object} content:需要写入的内容
     */
    insertOne(row, store?: IDBObjectStore) {
        if (!isObject(row) || Array.isArray(row)) logTypeError('content must be is an object');
        return new Promise((resolve, reject) => {
            if (!store) {
                store = this.getStore("readwrite");
            }
            const iRequest = store.add(row);
            iRequest.onsuccess = () => {
                resolve(iRequest.result);
            };
            iRequest.onerror = (event) => reject(getIDBError(event));
        });
    }

    /**
     * 更新数据
     * @param {UpdateData} doc 需要写入的内容
     */
    update(doc: UpdateData) {
        if (!isObject(doc) || Array.isArray(doc)) logTypeError('content must be is an object');
        return new Promise((resolve, reject) => {
            const store = this.getStore("readwrite");
            if (!doc[store.keyPath as string]) reject('content must have a primary key');
            const uRequest = store.put(doc);
            uRequest.onsuccess = () => resolve(uRequest.result);
            uRequest.onerror = (event) => reject(getIDBError(event));
        });
    }

    /**
     * 查询数据
     * @param {DBWhereCause} whereCause  需要查询的条件
     */
    find(whereCause = {} as DBWhereCause) {
        const { field, count, keyRange, orderBy } = whereCause;
        return new Promise((resolve, reject) => {
            const store = this.getStore("readonly");
            const list = [] as any[];
            //主键查询 or 索引
            let qRequest = !field || store.keyPath === field ? store.openCursor(keyRange, orderBy) : store.index(field!).openCursor(keyRange, orderBy)
            qRequest.onsuccess = (event: any) => {
                const cursor = event.target.result as IDBCursorWithValue;
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
     * @param {DBWhereCause} whereCause  需要删除的条件
     */
    remove(whereCause = {} as DBWhereCause) {
        if (!isObject(whereCause)) logTypeError('whereCause must be an object ');
        const { field, count, keyRange, orderBy } = whereCause;
        return new Promise((resolve, reject) => {
            const store = this.getStore("readwrite");
            const list = [] as Array<any>;
            let dRequest = !field || store.keyPath === field ?
                store.openCursor(keyRange, orderBy) : store.index(field!).openCursor(keyRange, orderBy)
            dRequest.onsuccess = (event: any) => {
                const cursor = event.target.result as IDBCursorWithValue;
                if (cursor) {
                    list.push(cursor.value);
                    cursor.delete();
                    if (count && list.length >= count) {
                        resolve(list);
                        return;
                    }
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
