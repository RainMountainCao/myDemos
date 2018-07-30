const mongoose = require('mongoose');
require('./model.js');

var menu = mongoose.model('menu');

var _menu = new menu({
    name: '糖醋里脊',
    price: 35,
    desc: '酸甜口味'
  });

_menu.price = 25;
_menu.save(err => {
  console.log(!err ? 'save success' : 'failed');
});