import dbConfig from "./config.js";


const db = new MinorDB(dbConfig.name, dbConfig.version);
db.open(dbConfig.schemas).then(() => {
    console.log(db.user);
    db.user.insert({ username: "1", password: '123', age: '1' });
    const users = [
        { username: "2", password: '123', age: '1' },
        { username: "3", password: '123', age: '1' },
        { username: "4", password: '123', age: '1' }
    ];
    db.user.insert(users);
    db.user.find()
        .then((result) => {
            console.log(result);
        })
        .catch((err) => {
            console.log(err);
        });
});



