import Table from "./Table";
declare type MinorTableInstance = InstanceType<typeof Table>;
declare type UpdateData = Array<Record<string, any>> | Record<string, any>;
export default class WhereCause {
    private _table;
    private whereCause;
    find: () => Promise<any>;
    remove: () => Promise<any>;
    constructor(table: MinorTableInstance);
    where(expr: any): this;
    sort(sortType?: string): this;
    limit(num: any): this;
    /**
     * 更新数据
     * @param {object/array} content:需要写入的内容
     */
    update(updateDate: UpdateData): Promise<unknown>;
}
export {};
