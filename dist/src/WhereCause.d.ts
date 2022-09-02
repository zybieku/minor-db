import Table from "./Table";
declare type MinorTableInstance = InstanceType<typeof Table>;
declare type UpdateData = Array<Record<string, any>> | Record<string, any>;
export default class WhereCause {
    private _table;
    private whereCause;
    find: () => Promise<Array<unknown>>;
    remove: () => Promise<any>;
    constructor(table: MinorTableInstance);
    where(expr: any): this;
    /**
     * 排序
     * @param sortType  ASC升序 DESC 降序
     */
    sort(sortType?: string): this;
    /**
     * 限制查询数目
     * @param num  数量
     */
    limit(num: any): this;
    /**
     * 复杂条件更新
     * @param updateDate  UpdateData 需要更新的数据
     */
    update(updateDate: UpdateData): Promise<unknown>;
}
export {};
