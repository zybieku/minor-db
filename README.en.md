# MinorDB

#### 介绍

**MinorDB** 是基于 IndexDB 封装的 web 前端数据库，轻量，Promise语法使用简单，支持 jQuery , Vue , React等

#### 安装与配置

> npm 安装

```js
npm install minordb
```

> 或者 browser 引入

```js
<script src="../dist/minordb.min.js"></script>
```

**配置**

```js
const dbConfig = {
    name: 'minorDbTest', //数据库名字
    version: 1,         //数据库版本
    //数据库的表配置
    schemas: {  
        user: '++id,username, &passsword, age',
        friends: 'name,age'
        message:'++id,from,to,msg'
    },
};

```

关于**schemas**

- key   : `user,friends，message`  分别对应一个 **table(`Store`)** 名字
- value :  第一个字段是主键，其他的是索引（~~非主键，和索引字段不用配置~~）

  - `++` ++代表自增主键
  - `&` 代表唯一索引，unique唯一不可重复

---

#### 动态创建

**创建，打开 minorDb**

```js

let minorDb = new MinorDB(dbConfig.name, dbConfig.version);
minorDb.open(dbConfig.schemas).then((event) => {}).catch(err => {});

```

#### 使用说明

下面的语句若没有特殊注明，默认都是自动使用了事务，支持promise(async/await)

1. **insert**

   可以直接使用 `insert` 方法插入一条或多条记录,支持promise

   ```js
   //一条
   let user={ username: "1", password: '123', age: '1' }
   const result = await minorDb.user.insert(user)

   //多条
   const users = [
    { username: "2", password: '123', age: '1' },
    { username: "3", password: '123', age: '1' },
    { username: "4", password: '123', age: '1' }
   ];
   const result1 = await minorDb.user.insert(users)

   ```

2. **Find**

   可以直接使用 `findone` 或 `find` 方法获取一条或多条记录。

```js
   //默认查询所有
   let users= await minorDb.user.find()

   //查询id>1的2条数据，升序排序
   //where 条件只能是主键或索引
   let lUsers =minorDb.user.where({ id: { '>': 1 }).limit(2).sort(asc).find()
  
```

3. **update**

   可以直接使用 `update` 方法更新数据库记录。

```js
    const user = { id: 1, username: "1", password: '1234', age: '1' };
    //user数据需要包含主键
    let result = minorDb.user.update(user)

    //如果不包含主键，需要手动设置索引where
    let result = minorDb.user.where({password: "1"}).update(user)
```

4. **remove**

   可以直接使用 remove 方法删除数据库记录。

```js
   let result = minorDb.user.remove({ id:  1  })
```
