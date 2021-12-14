export const isObject = (obj) => {
    return typeof obj === 'object' && obj !== null;
};

export const getIDBError = e => e.target.error;

export const logError = e => { throw new Error(e); };

export const indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;

export const IDBKeyRange = window.IDBKeyRange || window.webkitIDBKeyRange || window.msIDBKeyRange;
