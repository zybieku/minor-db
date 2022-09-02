import MinorDB from './MinorDB';
import { MinorTableInstance } from './Table';
declare type Schema<K extends Object> = {
    [key in keyof K]: MinorTableInstance;
};
export declare type MinorDBType<T extends Object> = Schema<T> & InstanceType<typeof MinorDB>;
export default MinorDB;
