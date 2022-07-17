import { DBWhereCause } from "types/MniorDbType";
import Table from "./Table";
import { isObject, IDBKeyRange, logError, getIDBError } from "./util";

type MinorTableInstance = InstanceType<typeof Table>
type UpdateData = Array<Record<string, any>> | Record<string, any>

//{ id: { '<=': 2,'>=':1} }
const RangFuncMap = {
    '<': 'upperBound',
    '>': 'lowerBound',
};

const OrderByMap = {
    'ASC': 'next',
    'DESC': 'prev',
};

export default class WhereCause {
    private _table: MinorTableInstance
    private whereCause: DBWhereCause
    public find: () => Promise<any>
    public remove: () => Promise<any>
    constructor(table: MinorTableInstance) {
        this._table = table;
        this.whereCause = { orderBy: 'next' };
        this.find = () => this._table.find(this.whereCause);
        this.remove = () => this._table.remove(this.whereCause);
    }

    where(expr) {
        if (!isObject(expr)) return this;
        const fields = Object.keys(expr);
        if (fields.length === 1) {
            let field = fields[0]
            this.whereCause.field = field
            const whereCause = expr[field];
            const wherekeys = Object.keys(whereCause);
            if (wherekeys.length === 1) {
                let key = wherekeys[0]
                if (key === '=') {
                    this.whereCause.keyRange = IDBKeyRange.only(whereCause[key]);
                    return this
                }
                const isNotEq = !key.endsWith('=');
                const rangkey = isNotEq ? key : key.slice(0, 1);
                this.whereCause.keyRange = IDBKeyRange[RangFuncMap[rangkey]](whereCause[key], isNotEq);
            } else {

            }
        }
        return this;
    }

    sort(sortType = 'ASC') {
        const orderBy = OrderByMap[sortType.toUpperCase()];
        if (!orderBy) logError('The value of param must be DESC or ASC');
        this.whereCause.orderBy = orderBy;
        return this;
    }

    limit(num) {
        if (!Number.isInteger(num)) logError('param type must be an int');
        this.whereCause.count = num;
        return this;
    }

    /**
     * 更新数据
     * @param {object/array} content:需要写入的内容
     */
    update(updateDate: UpdateData) {
        const { field, count, keyRange, orderBy } = this.whereCause;
        return new Promise((resolve, reject) => {
            const store = this._table.getStore("readwrite");
            let uRequest
            let _pkey = store.keyPath as string
            if (!field || _pkey === field) {
                //主键查询
                uRequest = store.openCursor(keyRange, orderBy);
            } else {
                //索引
                uRequest = store.index(field!).openCursor(keyRange, orderBy);
            }
            const list = [] as any[];
            uRequest.onsuccess = (event: any) => {
                const cursor = event.target.result as IDBCursorWithValue;
                if (cursor) {
                    updateDate[_pkey] = cursor.primaryKey
                    cursor.update(updateDate)
                    list.push(cursor.primaryKey);
                    if (count && list.length >= count) {
                        resolve(list);
                        return;
                    }
                    cursor.continue();
                } else {
                    resolve(list);
                }
            };
            uRequest.onerror = (event) => reject(getIDBError(event));
        });
    }

}