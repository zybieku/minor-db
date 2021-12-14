/* eslint-disable no-var */
/* eslint-disable no-undef */

var expect = chai.expect;
var minorDb;

const tables = Object.keys(dbConfig.schemas);
const tableName = tables.join(',');

describe('minorDb初始化配置', function () {
    it('校验配置Schema', function () {
        expect(dbConfig.version).to.ok;
        expect(dbConfig.name).to.ok;
        expect(dbConfig.schemas).to.an('object');
    });
    it('创建一个minorDb数据库', function () {
        minorDb = new MinorDB(dbConfig.name, dbConfig.version);
        expect(minorDb.name).to.be.eq(dbConfig.name);
    });

    it('根据配置，初始化数据的table', function () {
        return minorDb.open(dbConfig.schemas).then((event) => {
            expect(event.type).to.equal('success');
        }).catch(err => {
            expect(err).to.not.ok;
        });
    });

    it(tableName + ' 表已经创建', function () {
        tables.forEach(table => {
            expect(minorDb[table]).to.an('object');
        });
        expect(minorDb.getTableNames().length).to.eq(tables.length);
    });
});