/* eslint-disable no-undef */
if (!expect) expect = chai.expect;

const users = [
    { username: "2", password: '123', age: '1' },
    { username: "3", password: '123', age: '1' },
    { username: "4", password: '123', age: '1' }
];

describe('插入 # insert ', function () {
    before(function (done) {
        if (minorDb) {
            done();
            return;
        }
        minorDb = new MinorDB(dbConfig.name, dbConfig.version);
        return minorDb.init(dbConfig.schemas);
    });
    it('table.insert(Object).then().catch()', function () {
        return minorDb.user.insert({ username: "1", password: '123', age: '1' }).then(res => {
            expect(res).to.be.a('number');
        }).catch(err => {
            expect(err).to.not.ok;
        });

    });

    it('table.insert(Array).then().catch()', function () {
        return minorDb.user.insert(users).then(res => {
            expect(res.length).to.be.eq(users.length);
        }).catch(err => {
            expect(err).to.not.ok;
        });
    });
});

describe('查询 # find', function () {
    before(function (done) {
        if (minorDb) {
            done();
            return;
        }
        minorDb = new MinorDB(dbConfig.name, dbConfig.version);
        return minorDb.open(dbConfig.schemas);
    });
    it('table.find().then().catch()', function () {
        return minorDb.user.find().then(res => {
            expect(res).to.be.a('array');
            console.log('查询', res);
        }).catch(err => {
            expect(err).to.not.ok;
        });

    });

    it('table.where(Object).limit(2).sort(asc).find().then().catch()', function () {
        return minorDb.user.where({ username: { '=': '2' } }).limit(10).sort('asc').find().then(res => {
            expect(res).to.be.a('array');
            console.log('条件查询', res);
        }).catch(err => {
            expect(err).to.not.ok;
        });

    });

    /*    it('insert插入一组数据Array', function () {
             return minorDb.user.insert(users).then(res => {
                 expect(res.length).to.be.eq(users.length);
             }).catch(err => {
                 expect(err).to.not.ok;
             });
         }); */
});

describe('修改 # update', function () {
    const user = {id: 1,  username: "12", password: '1234', age: '1' };
    before(function (done) {
        if (minorDb) {
            done();
            return;
        }
        minorDb = new MinorDB(dbConfig.name, dbConfig.version);
        return minorDb.open(dbConfig.schemas);
    });
    it('table.update(Object).then().catch()', function () {
        return minorDb.user.update(user).then(res => {
            console.log(res);
            expect(res).to.be.eq(1);
        }).catch(err => {
            expect(err).to.not.ok;
        });

    });

    it('table.where(Object).update(Object).then().catch()', function () {
        const user1 = { username: "2", password: '12346', age: '1' };
        return minorDb.user.where({ username: { '=': '2' }}).update(user1).then(res => {
            console.log('条件更新',res);
            expect(res).to.be.a('array');
        }).catch(err => {
            expect(err).to.not.ok;
        });

    });

});


describe('删除 # remove', function () {
    before(function () {
        if (minorDb) {
            minorDb.close();
        }
        minorDb = new MinorDB(dbConfig.name, dbConfig.version);
        return minorDb.open(dbConfig.schemas);
    });
    it('table.remove(Object).then().catch()', function () {
        return minorDb.user.where({ id: { '>=': 1 } }).remove().then(res => {
            console.log('删除', res);
            expect(res).to.be.a('array');
        }).catch(err => {
            expect(err).to.not.ok;
        });

    });
    it('table.where(Object).limit(4).remove().then().catch()', function () {
        return minorDb.user.where({ id: { '>=': 2 } }).limit(4).remove().then(res => {
            console.log('删除', res);
            expect(res).to.be.a('array');
        }).catch(err => {
            expect(err).to.not.ok;
        });

    });

});