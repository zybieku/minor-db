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
    constructor(table) {
        this._table = table;
        this.whereCause = { orderBy: 'next' };
        this._bind();
    }

    where(expr) {
        if (!isObject(expr)) return this;
        const fields = Object.keys(expr);
        if (fields.length === 1) {
            fields.forEach(field => {
                const whereCause = expr[field];
                const wherekeys = Object.keys(whereCause);
                if (wherekeys.length === 1) {
                    wherekeys.forEach(key => {
                        const isNotEq = !key.endsWith('=');
                        const rangkey = isNotEq ? key : key.slice(0, 1);
                        this.whereCause.keyRange = IDBKeyRange[RangFuncMap[rangkey]](whereCause[key], isNotEq);
                    });
                } else {

                }
            });
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

    _bind() {
        ['find', 'remove'].forEach(func => {
            this[func] = (arg) => this._table[func](...[arg, this.whereCause]);
        });
    }

}