var O = Object.defineProperty;
var B = (a, e, t) => e in a ? O(a, e, { enumerable: !0, configurable: !0, writable: !0, value: t }) : a[e] = t;
var c = (a, e, t) => (B(a, typeof e != "symbol" ? e + "" : e, t), t);
const y = (a) => typeof a == "object" && a !== null, m = (a) => a.target.error, f = (a) => {
  throw new Error(a);
}, b = (a) => {
  throw new TypeError(a);
}, C = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB, g = window.IDBKeyRange || window.webkitIDBKeyRange || window.msIDBKeyRange, R = {
  "<": "upperBound",
  ">": "lowerBound"
}, S = {
  ASC: "next",
  DESC: "prev"
};
class _ {
  constructor(e) {
    c(this, "_table");
    c(this, "whereCause");
    c(this, "find");
    c(this, "remove");
    this._table = e, this.whereCause = { orderBy: "next" }, this.find = () => this._table.find(this.whereCause), this.remove = () => this._table.remove(this.whereCause);
  }
  where(e) {
    if (!y(e))
      return this;
    const t = Object.keys(e);
    if (t.length === 1) {
      let r = t[0];
      this.whereCause.field = r;
      const s = e[r], n = Object.keys(s);
      for (const i of n) {
        let d = s[i];
        if (i === "=")
          return this.whereCause.keyRange = g.only(d), this;
        const o = !i.endsWith("="), u = o ? i : i.slice(0, 1);
        let p = this.whereCause.keyRange;
        if (p) {
          let { lower: h, upper: l, lowerOpen: w, upperOpen: k } = p;
          return h ? (l = d, k = o) : (h = d, w = o), h >= l && f("lower must to less than upper value"), this.whereCause.keyRange = g.bound(h, l, w, k), this;
        }
        this.whereCause.keyRange = g[R[u]](d, o);
      }
    }
    return this;
  }
  /**
   * 排序
   * @param sortType  ASC升序 DESC 降序
   */
  sort(e = "ASC") {
    const t = S[e.toUpperCase()];
    return t || f("The value of param must be DESC or ASC"), this.whereCause.orderBy = t, this;
  }
  /**
   * 限制查询数目
   * @param num  数量
   */
  limit(e) {
    return Number.isInteger(e) || f("param type must be an int"), this.whereCause.count = e, this;
  }
  /**
   * 复杂条件更新
   * @param updateDate  UpdateData 需要更新的数据
   */
  update(e) {
    const { field: t, count: r, keyRange: s, orderBy: n } = this.whereCause;
    return new Promise((i, d) => {
      const o = this._table.getStore("readwrite");
      let u = o.keyPath, p = !t || u === t ? o.openCursor(s, n) : o.index(t).openCursor(s, n);
      const h = [];
      p.onsuccess = (l) => {
        const w = l.target.result;
        if (w) {
          if (e[u] = w.primaryKey, w.update(e), h.push(w.primaryKey), r && h.length >= r) {
            i(h);
            return;
          }
          w.continue();
        } else
          i(h);
      }, p.onerror = (l) => d(m(l));
    });
  }
}
class D {
  constructor(e, t) {
    c(this, "minorDb");
    c(this, "_name");
    c(this, "_pkey", "");
    c(this, "where");
    c(this, "limit");
    c(this, "sort");
    this.minorDb = e, this._name = t, this.where = (r) => new _(this).where(r), this.limit = (r) => new _(this).limit(r), this.sort = (r) => new _(this).sort(r);
  }
  get idb() {
    return this.minorDb._idb;
  }
  /**
  * 根据schema配置信息创建table
  * @param {String} schema 数据库字段
  */
  create(e) {
    const t = e.split(","), r = t[0].trim(), s = r.startsWith("++");
    this._pkey = s ? r.slice(2) : r;
    const n = { keyPath: this._pkey, autoIncrement: s }, i = this.idb.createObjectStore(this._name, n);
    if (!(t.length <= 1))
      for (let d = 1; d < t.length; d++) {
        const o = t[d].trim(), u = o.startsWith("&"), p = u ? o.slice(1) : o;
        i.createIndex(p, p, { unique: u });
      }
  }
  /**
   * 获取store的实例
   * 默认开启 transaction事物
   * @param {String} rwType 
   * @returns objectStore
   */
  getStore(e) {
    var t;
    return this.minorDb.isOpen || f("the indexdb is not open"), (t = this.idb) == null ? void 0 : t.transaction([this._name], e).objectStore(this._name);
  }
  // _bind() {
  //     ['where', 'limit', 'sort'].forEach(func => {
  //         this[func] = (...arg) => new WhereCause(this)[func](...arg);
  //     });
  // }
  /**
   * 插入数据，可以一条或多条
   * @param {object|array} content:需要写入的内容
   */
  insert(e) {
    y(e) || b("content must be is an object or array ");
    const t = this.getStore("readwrite");
    return Array.isArray(e) ? Promise.all(e.map((r) => this.insertOne(r, t))) : this.insertOne(e, t);
  }
  /**
   * 插入一条数据
   * @param {object} content:需要写入的内容
   */
  insertOne(e, t) {
    return (!y(e) || Array.isArray(e)) && b("content must be is an object"), new Promise((r, s) => {
      t || (t = this.getStore("readwrite"));
      const n = t.add(e);
      n.onsuccess = () => {
        r(n.result);
      }, n.onerror = (i) => s(m(i));
    });
  }
  /**
   * 更新数据
   * @param {UpdateData} doc 需要写入的内容
   */
  update(e) {
    return (!y(e) || Array.isArray(e)) && b("content must be is an object"), new Promise((t, r) => {
      const s = this.getStore("readwrite");
      e[s.keyPath] || r("content must have a primary key");
      const n = s.put(e);
      n.onsuccess = () => t(n.result), n.onerror = (i) => r(m(i));
    });
  }
  /**
   * 查询数据
   * @param {DBWhereCause} whereCause  需要查询的条件
   */
  find(e = {}) {
    const { field: t, count: r, keyRange: s, orderBy: n } = e;
    return new Promise((i, d) => {
      const o = this.getStore("readonly"), u = [];
      let p = !t || o.keyPath === t ? o.openCursor(s, n) : o.index(t).openCursor(s, n);
      p.onsuccess = (h) => {
        const l = h.target.result;
        if (l) {
          if (u.push(l.value), r && u.length >= r)
            return i(u), u;
          l.continue();
        } else
          i(u);
      }, p.onerror = (h) => d(m(h));
    });
  }
  /**
   * 删除数据
   * @param {DBWhereCause} whereCause  需要删除的条件
   */
  remove(e = {}) {
    y(e) || b("whereCause must be an object ");
    const { field: t, count: r, keyRange: s, orderBy: n } = e;
    return new Promise((i, d) => {
      const o = this.getStore("readwrite"), u = [];
      let p = !t || o.keyPath === t ? o.openCursor(s, n) : o.index(t).openCursor(s, n);
      p.onsuccess = (h) => {
        const l = h.target.result;
        if (l) {
          if (u.push(l.value), l.delete(), r && u.length >= r) {
            i(u);
            return;
          }
          l.continue();
        } else
          i(u);
      }, p.onerror = (h) => d(m(h));
    });
  }
  /**
   * 清空数据表数据
   */
  clear() {
    return new Promise((e, t) => {
      const r = this.getStore("readwrite").clear();
      r.onsuccess = () => e(r.result), r.onerror = (s) => t(m(s));
    });
  }
}
class P {
  constructor(e, t) {
    c(this, "_name");
    c(this, "_version");
    c(this, "_isOpen", !1);
    c(this, "request");
    c(this, "_idb");
    c(this, "upgradeFunc");
    return this._name = e, this._version = t || 1, this;
  }
  /**
   * 数据的名字.
   * @type {string}
   */
  get name() {
    return this._name;
  }
  /**
   * 数据库的版本
   * @type {number}
   */
  get version() {
    return this._version;
  }
  /**
   * 是否打开
   */
  get isOpen() {
    return this._isOpen;
  }
  /**
   * 监听的onupgradeneeded的触发函数
   * @param {Function} cb  onupgradeneeded 回调
   */
  onupgradeneeded(e) {
    this.upgradeFunc = e;
  }
  /**
   * 创建并打开数据库，如果已经创建过了，即直接打开
   * @param {Object}
   * @returns Promise
   */
  open(e) {
    return this.close(), this._stores(e), new Promise((t, r) => {
      this.request = C.open(this._name, this._version), this.request.onupgradeneeded = (s) => {
        this._idb = s.target.result, this._addStores(e), this.upgradeFunc && this.upgradeFunc(s), console.log(s);
      }, this.request.onsuccess = (s) => {
        this._idb = s.target.result, this._isOpen = !0, t(s), console.log(22);
      }, this.request.onerror = (s) => r(m(s));
    });
  }
  _addStores(e) {
    for (const t of Object.keys(e))
      this._idb.objectStoreNames.contains(t) || this[t].create(e[t]);
  }
  /**
   * 根据schemas创建table
   * @param {Object} schemas table的配置文件
   * @returns MinorDB
   */
  _stores(e) {
    if (!y(e))
      throw new Error("schemas required an  Object");
    for (const t of Object.keys(e)) {
      if (this[t])
        break;
      this[t] = new D(this, t);
    }
    return this;
  }
  /**
   * 获取所有的table名字
   * @returns Array
   */
  getTableNames() {
    return this._idb && this._idb.objectStoreNames;
  }
  /**
   * 关闭数据库
   */
  close() {
    var e;
    this._isOpen && ((e = this._idb) == null || e.close(), this._isOpen = !1, this._idb = void 0);
  }
  /**
   * 销毁数据库
   */
  drop() {
    return this.close(), new Promise((e, t) => {
      const r = C.deleteDatabase(this._name);
      r.onsuccess = (s) => e(s), r.onerror = (s) => t(s);
    });
  }
}
export {
  P as default
};
