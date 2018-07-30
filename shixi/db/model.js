const mongoose = require('mongoose');
const config = require('./config.js');

console.log('连接mongodb');
mongoose.connect(config.uri);


let Menu = new mongoose.Schema({
    id: String,
    name: String,
    price: Number,
    desc: String,
    img: String,
    exist: Boolean,
    type: Array
  });
mongoose.model('menu', Menu);

let User = new mongoose.Schema({
  id: Number,
  name: String,
  password: String,
  type: Number,
  exist: Boolean
});
mongoose.model('user', User);


let Table = new mongoose.Schema({
  num: Number,
  status: Number,
  menus: Array
});
mongoose.model('table', Table);

let Type = new mongoose.Schema({
  type: String
});
mongoose.model('type', Type);

