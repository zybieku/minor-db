const dbConfig = {
    name: 'minorDbTest', //数据库名字
    version: 1, //数据库版本
    //数据库表的配置
    schemas: {
        user: '++id,username, &passsword, age',
        friends: 'name,age'
    },
};

