//泰州数据库
export default class TzDB {
    constructor(database, version) {
        this.database = database;
        this.version = version;
        // 创建数据库
        this.init();
    }

    // 创建数据库
    init() {
        this.request = window.indexedDB.open(this.database, this.version);
        this.request.onsuccess = (event) => {
            this.db = event.target.result;
        };
        return this;
    }

    //创建表
    stores(tableObj) {
        this.tableObj = tableObj;
        this.request.onupgradeneeded = (event) => {
            this.db = event.target.result;
            Object.keys(this.tableObj).forEach((tableName) => {
                if (!this.db.objectStoreNames.contains(tableName)) {
                    const keyArr = this.tableObj[tableName].split(",");
                    const objectStore = this.db.createObjectStore(tableName, {
                        keyPath: keyArr[0],
                    });
                    //建立索引:可以让你搜索任意字段。如果不建立索引，默认只能搜索主键（即从主键取值）。
                    keyArr.forEach((keyItem, index) => {
                        if (index > 0) {
                            objectStore.createIndex(keyItem, keyItem, { unique: true });
                        }
                    });
                }
            });
        };
        return this;
    }

    /**
   * 写入所有表数据
   * @param {string} storeName:表名称
   * @param {object/array} content:需要写入的内容
   */
    addAll(storeName, content) {
        if (content instanceof Array) {
            const addAllRequest = this.db
                .transaction([storeName], "readwrite")
                .objectStore(storeName);
            content.forEach((contentItem) => {
                addAllRequest.add(contentItem);
            });
        } else if (typeof content === "object") {
            this.db
                .transaction([storeName], "readwrite")
                .objectStore(storeName)
                .put(content);
        }
    }

    /**
   * 获取当前表所有数据
   * @param {string} storeName:表名称
   */
    getAll(storeName) {
        return new Promise((resolve) => {
            const objectStore = this.db
                .transaction(storeName)
                .objectStore(storeName)
                .getAll();
            objectStore.onsuccess = () => {
                console.log(objectStore.result);
                resolve(objectStore.result);
            };
            objectStore.onerror = () => {
                console.log("获取表数据失败");
            };
        });
    }

    /**
   * 获取当前表指定数据
   * @param {string} storeName:表名称
   * @param {string} storeContent:需要查询的内容
   * @param {string} 非必填 storeKey:需要查询的字段名[必须有索引],如果不传默认查主键
   */
    get(storeName, storeContent, storeKey) {
        return new Promise((resolve) => {
            const transaction = this.db.transaction([storeName], "readonly");
            if (storeKey) {
                const request = transaction
                    .objectStore(storeName)
                    .index(storeKey)
                    .get(storeContent);
                request.onsuccess = (event) => {
                    resolve(event.target.result);
                };
                request.onerror = () => {
                    console.log("获取表数据失败");
                };
            } else {
                const request = transaction.objectStore(storeName).get(storeContent);
                request.onsuccess = () => {
                    if (request.result) {
                        console.log(request.result);
                        resolve(request.result);
                    } else {
                        console.log("未获得数据记录");
                    }
                };
                request.onerror = () => {
                    console.log("获取表数据失败");
                };
            }
        });
    }

    /**
   * 删除指定内容
   * @param {string} storeName:表名称
   * @param {string} storeContent:需要删除的内容,必须要是主键字段的,非必填，如果没有默认删除全部
   */
    delete(storeName, storeContent) {
        console.log("storeName, storeContent", storeName, storeContent);
        if (storeContent) {
            const request = this.db
                .transaction([storeName], "readwrite")
                .objectStore(storeName)
                .delete(storeContent);
            request.onsuccess = function () {
                console.log("数据删除成功");
            };
            request.onerror = () => {
                console.log("数据删除失败");
            };
        } else {
            const request = this.db
                .transaction([storeName], "readwrite")
                .objectStore(storeName)
                .clear();
            request.onsuccess = function () {
                console.log("数据删除成功");
            };
            request.onerror = () => {
                console.log("数据删除失败");
            };
        }
    }
}
