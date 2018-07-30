const path = require('path');
const fs = require('fs');
const Koa = require('koa');
const Router = require('koa-route');
const staic = require('koa-static');
const bodyParse = require('koa-body');
const session = require('koa-session');
const utils = require('./server/utils');
let db = require('./db/db.js');

let app = new Koa();
app.keys = ['some secret hurr'];

// session中间件
const CONFIG = {
    key: 'koa:sess', /** (string) cookie key (default is koa:sess) */
    /** (number || 'session') maxAge in ms (default is 1 days) */
    /** 'session' will result in a cookie that expires when session/browser is closed */
    /** Warning: If a session cookie is stolen, this cookie will never expire */
    maxAge: 6000000,
    overwrite: true, /** (boolean) can overwrite or not (default true) */
    httpOnly: true, /** (boolean) httpOnly or not (default true) */
    signed: true, /** (boolean) signed or not (default true) */
    rolling: false, /** (boolean) Force a session identifier cookie to be set on every response. The expiration is reset to the original maxAge, resetting the expiration countdown. (default is false) */
    renew: false, /** (boolean) renew session when session is nearly expired, so we can always keep user logged in. (default is false)*/
};
app.use(session(CONFIG, app));

// 处理表单中间件
app.use(bodyParse({
    multipart: true,
    formidable: {
        maxFileSize: 200*1024*1024
    }
}));

// 静态文件目录
app.use(staic(path.join('./src/')));

// 根目录
app.use(Router.get('/', async ctx => {
    console.log(ctx.session);
    // session存在
    if(ctx.session.userId) {
        ctx.redirect('/management');
    }else {
        ctx.redirect('/login');
    }
}));

// 登陆post处理
app.use(Router.post('/login', async (ctx) => {
    console.log('登陆')
    // 分别返回不同的主页 
    var view = ctx.request.body.status === 'management' ? 'management_index' : 'staff_index';
    console.log('login');
    // 连数据库
    await db.user.findOne({"name": ctx.request.body.username, "type": ctx.request.body.status=='management'?1:0}, function(err, data) {
        if(!err) {
            if(data) {
                if(data.password == ctx.request.body.password) {
                    console.log('登陆成功');
                    ctx.session.userId = data.id;
                    ctx.session.userType = data.type;
                    ctx.redirect(`/management`);
                }else {
                    console.log('密码错误')
                    ctx.body = '密码错误'
                }
            }else {
                console.log('用户不存在')
                ctx.body = '用户不存在';
            }
        }else {
            console.log('查询出错')
            ctx.body = '查询出错';
        }
    });
}));

// 登录界面
app.use(Router.get('/login', async (ctx) => {
    console.log('请求登陆html');
    ctx.type = "text/html";
    ctx.body = fs.readFileSync('./src/login.html');
}));

// 管理员界面
app.use(Router.get('/management', async (ctx) => {
    console.log('管理员主页')
    console.log(ctx.session);
    if(ctx.session.userId) {
        ctx.type = "text/html";
        ctx.body = fs.readFileSync('./src/view/management_index.html');
    }else {
        ctx.redirect('/login');
    }
}));

// 员工界面
app.use(Router.get('/staff', async ctx => {
    console.log('员工页')
    if(ctx.session.userId) {
        ctx.type = "text/html";
        ctx.body = fs.readFileSync('./src/view/staff_index.html');
    }else {
        ctx.redirect('/login');
    }
}));

// table
app.use(Router.get('/table', async ctx => {
    let json = {},
        pageIndex = parseInt(ctx.query.pageindex),
        count = parseInt(ctx.query.count);
    // 返回总页数
    //json.sumPages = db.tables.find().length;
    json.tables = [];
    // 数据库分页查询
    //await db.table.find({}, (err, data) => {

    //});
       // 构建json
       // for循环从数据库查询到的数据
       // 直接push进json中

    ctx.type = 'text/json';
    ctx.body = JSON.stringify(json);
}));

// 菜单模块
app.use(Router.get('/menu', async ctx => {
    //ctx.body = '菜单请求成功';
    console.log(ctx.request.query);
    let query = ctx.request.query;
    query.pageindex = query.pageindex ? parseInt(query.pageindex) : 0;
    query.count = query.count ? parseInt(query.count) : 3;
    let body = {};
    if(query.id) {
        console.log('存在');
        console.log(query.id);

        body.data = await db.menu.findOne({id: query.id}, (err) => {
            if(err) {
                console.log(err);
                ctx.body = '请求出错';
            }
        });
    }else {
        body.data = await db.menu.find({}, (err, data) => {
            if(err) {
                console.log(err);
                ctx.body = '请求出错';
            }
        }).skip((query.pageIndex-1)*query.count).limit(query.count);
     }
    var rows = await db.menu.find().count();
    body.pageIndex = Math.ceil(rows/query.count);
    ctx.type = 'json';
    ctx.body = body;
}));

app.use(Router.get('/type', async ctx => {
    ctx.response.type = 'json';
    return ctx.body = await db.type.find({}, (err, data) => {
        if(err) {
            console.log(err);
            ctx.body = 'type请求出错';
        }
    })
}));

app.use(Router.post('/add_dishes', async ctx => {
    // 先根据名字查数据库 
    // 查到就用 返回提示  更新 修改
    console.log(ctx.query);
    if(ctx.request.body) {
        let body = ctx.request.body;
        let id = utils.getId(),
            img_name,
            data = {};
        console.log('body: ');
        console.log(body);
        data = await db.menu.findOne({id: body.menu_id}, (err, data) => {
            if(err) {
                console.log('插入数据库查找失败');
            }
            if(data) {
                console.log('添加的菜品存在');
                console.log(data);
                id = data.id;
                img_name = data.img;
                // ctx.body('已有，是否更新');
                // 更新
                if(ctx.request.files && ctx.request.files.menu_img) {
                    console.log('有图片');
                    let file = ctx.request.files.menu_img;
                    const reader = fs.createReadStream(file.path);    // 创建可读流
                    img_name = 'images/' + id + '.' + file.name.split('.').pop();        // 获取上传文件扩展名
                    const upStream = fs.createWriteStream(`src/${img_name}`);        // 创建可写流
                    reader.pipe(upStream);    // 可读流通过管道写入可写流
                    db.menu.update({id: id}, {
                        img: img_name
                    }, err => {
                        if(err) {
                            console.log(err);
                        }
                    });
                }
                db.menu.update({id: id}, {
                    id: id,
                    name: body.menu_name,
                    price: body.menu_price,
                    desc: body.menu_desc,
                    img: img_name,
                    exist: true,
                    type: body.types
                }, err => {
                    if(err) {
                        console.log(err);
                        //return '上传失败';
                    }else {
                        //return '上传成功';
                    }
                });
                console.log(img_name);
            }else {
                console.log('不存在');
                if(ctx.request.files && ctx.request.files.menu_img) {
                    let file = ctx.request.files.menu_img;
                    img_name = 'images/' + id + '.' + file.name.split('.').pop();        // 获取上传文件扩展名
                    const reader = fs.createReadStream(file.path);    // 创建可读流
                    const upStream = fs.createWriteStream(`src/${img_name}`);        // 创建可写流
                    reader.pipe(upStream);    // 可读流通过管道写入可写流
                }
                let menu = new db.menu({
                    id: id,
                    name: body.menu_name,
                    price: body.menu_price,
                    desc: body.menu_desc,
                    img: img_name,
                    exist: true,
                    type: body.types
                });
                menu.save(err => {
                    if(err){
                        console.log(err);
                       // return '上传失败';
                    }else {
                        //return '上传成功';
                    }
                });
                console.log(img_name);
            }
        });
        //console.log(ctx.body);
        ctx.body = data;
    }
}));

app.use(Router.get('/add_dishes', async ctx => {
    var query = ctx.request.query;
    if(query.id) {
        ctx.body = await db.menu.update({id: query.id}, {
            exist: query.status
        }, err => {
            if(err) {
                console.log('状态查找数据库失败');
            }
        });
    }
}));

app.use(Router.post('/change_pwd', async ctx => {
    var body = ctx.request.body,
        status = {};
    status.data = await db.user.findOne({id: ctx.session.userId}, (err, data) => {
        if(err) {
            console.log('查询数据库出错');
        }
        console.log(data);
        console.log(body['old-pwd']);
        console.log(body['new-pwd']);
        // 校验密码
        if(data.password == body['old-pwd']){
            console.log('密码匹配成功');
            db.user.update({id: ctx.session.userId}, {
                password: body['new-pwd']
            }, err => {
                status.code = 0;
            });
        }else {
            status.code = 1;
        }
    });
    ctx.body = status;
}));

// 监听并回调
app.listen(3000, (err) => {
    if(err) {
        console.log(err);
    }
    console.log('prot 80 bound');
});
