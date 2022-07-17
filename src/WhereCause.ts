import { DBWhereCause } from "types/MniorDbType";
import { MinorTableInstance } from "./Table";
import { isObject, IDBKeyRange, logError } from "./util";

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
            const whereCause = expr[fields[0]];
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


}