const mongoose = require('mongoose');
require('./model.js');

var menu = mongoose.model('menu');

    menu.find({}, (err, menus) => {
        if(err) console.log('err');
        console.log(menus);
    });