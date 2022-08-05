export const isObject = (obj: any): obj is Record<any, any> => {
  return typeof obj === "object" && obj !== null;
};

export const getIDBError = (e: any) => e.target.error;

export const logError = (e) => {
  throw new Error(e);
};

export const logTypeError = (e) => {
  throw new TypeError(e);
};

//@ts-ignore
export const indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;

//@ts-ignore
export const IDBKeyRange = window.IDBKeyRange || window.webkitIDBKeyRange || window.msIDBKeyRange;
