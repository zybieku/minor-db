import { MinorTableInstance } from "./Table";
export default class WhereCause {
    private _table;
    private whereCause;
    find: () => Promise<any>;
    remove: () => Promise<any>;
    constructor(table: MinorTableInstance);
    where(expr: any): this;
    sort(sortType?: string): this;
    limit(num: any): this;
}
