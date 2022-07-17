declare global {
  interface window {
    mozIndexedDB: any;
    webkitIndexedDB: any;
    msIndexedDB: any;
    webkitIDBKeyRange: any;
    msIDBKeyRange: any;
  }
}
export { };
