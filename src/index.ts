import MinorDB from './MinorDB';
import { MinorTableInstance } from './Table';


type Schema<K extends Object> = {
    [key in keyof K]: MinorTableInstance
}

export type MinorDBType<T> = Schema<T> & InstanceType<typeof MinorDB>;

export default MinorDB;