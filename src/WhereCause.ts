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
    public find: () => Promise<Array<unknown>>
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
            //field 对应的条件
            const whereCause = expr[field];
            const wherekeys = Object.keys(whereCause);

            for (const key of wherekeys) {
                // key:> < 等条件
                // value:key 对应的值
                let value = whereCause[key]
                if (key === '=') {
                    this.whereCause.keyRange = IDBKeyRange.only(value);
                    return this
                }

                //没有=就是,开区间
                const isOpen = !key.endsWith('=');
                const rangkey = isOpen ? key : key.slice(0, 1);

                let keyRange = this.whereCause.keyRange
                if (keyRange) {
                    let { lower, upper, lowerOpen, upperOpen } = keyRange as any
                    if (lower) {
                        upper = value
                        upperOpen = isOpen
                    } else {
                        lower = value
                        lowerOpen = isOpen
                    }
                    if (lower >= upper) {
                        logError('lower must to less than upper value')
                    }
                    this.whereCause.keyRange = IDBKeyRange.bound(lower, upper, lowerOpen, upperOpen);
                    return this
                }
                this.whereCause.keyRange = IDBKeyRange[RangFuncMap[rangkey]](value, isOpen);
            }
        }
        return this;
    }

    /**
     * 排序
     * @param sortType  ASC升序 DESC 降序
     */
    sort(sortType = 'ASC') {
        const orderBy = OrderByMap[sortType.toUpperCase()];
        if (!orderBy) logError('The value of param must be DESC or ASC');
        this.whereCause.orderBy = orderBy;
        return this;
    }

    /**
     * 限制查询数目
     * @param num  数量
     */
    limit(num) {
        if (!Number.isInteger(num)) logError('param type must be an int');
        this.whereCause.count = num;
        return this;
    }

    /**
     * 复杂条件更新
     * @param updateDate  UpdateData 需要更新的数据
     */
    update(updateDate: UpdateData) {
        const { field, count, keyRange, orderBy } = this.whereCause;
        return new Promise((resolve, reject) => {
            const store = this._table.getStore("readwrite");
            let _pkey = store.keyPath as string
            let uRequest = !field || _pkey === field ? store.openCursor(keyRange, orderBy) : store.index(field!).openCursor(keyRange, orderBy);
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