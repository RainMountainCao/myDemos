const mongoose = require('mongoose');

require('./model.js');
const db = {};

db.menu = mongoose.model('menu');
db.user = mongoose.model('user');
db.table = mongoose.model('table');
db.type = mongoose.model('type');

module.exports = db;


//require('./model.js');
/*
var Menu = mongoose.model('menu');

var menu = new Menu({
    name: '糖醋里脊',
    price: 35,
    desc: '酸甜口味'
});

menu.price(25);

menu.save(err => {
    console.log(!err ? 'save success' : 'failed');
});
*/