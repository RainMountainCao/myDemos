const fs = require('fs');
const path = require('path');
const Koa = require('koa');
const route = require('koa-route');
const serve = require('koa-static');
const ejs = require('ejs');
const views = require('co-views');

const render = views('./view/include', {
	map: { html: 'ejs' }
});

const app = new Koa();

// 配置静态资源  设置根目录
//const _static = serve(path.join('./mock/book'));
const _static = serve(path.join('./'));
app.use(_static);

// 配置路由
app.use(route.get('/chapter', async function(ctx) {
	ctx.type = 'text/json';
	ctx.body = '目录';
}));

app.use(route.get('/readcontent', async function(ctx) {
	console.log('readContent');
	let query_obj = ctx.request.query;
	let book_id = query_obj.book_id;
	let chapter_num = query_obj.chapter_num;
	// 根据query 传入模板文件  数据  用EJS
	ctx.type = 'text/html';
	ctx.body = await render('readContent', {
		book: JSON.parse(await fs.readFileSync('./mock/book/'+book_id+'.json', 'utf-8')),
		chapter_num: chapter_num
	});
}));
app.use(route.get('/chapters', async function(ctx) {
	console.log('chapters');
	let query_obj = ctx.request.query;
	let book_id = query_obj.book_id;
	// 根据query 传入模板文件  数据  用EJS
	ctx.type = 'text/html';
	ctx.body = await render('chaptersContent', {
		book: JSON.parse(await fs.readFileSync('./mock/book/'+book_id+'.json', 'utf-8'))
	});
}));

app.use(route.get('/read', async function(ctx) {
	console.log('read');
	ctx.response.set('Cache-Control', 'no-cache');
	ctx.type = 'text/html';
	ctx.body = await fs.readFileSync('./view/include/read.html');
}));

// http://www.runoob.com/nodejs/nodejs-mysql.html

/*
app.use(async ctx => {
	ctx.body = '<h1>哈哈哈</h1>';
	let path = ctx.request.path;
	//console.log(path);
	if(path === '/') {
		ctx.response.type = 'html';
		ctx.body = fs.createReadStream('canvas/template/login.html');
	}else if(path === '/game') {
		ctx.response.type = 'html';
		ctx.body = fs.createReadStream('canvas/webserver/webgl.html');
	}else if(path === '/js/three.js') {
		ctx.response.type = 'text/javascript';
		ctx.body = fs.createReadStream('canvas/webserver/js/three.js');
	}else if(path.startsWith('/image/')) {
		//ctx.response.type = 'text/javascript';
		ctx.body = fs.createReadStream('canvas/webserver' + path);
	}

	// canvas/webserver/image/0.jpg
});
*/


app.listen(3000, () => {
	console.log('port 3000 bound!')
});


app.use(route.get('/test', async function(ctx) {
	console.log('test');
	ctx.response.set('Cache-Control', 'no-cache');
	ctx.type = 'text/html';
	ctx.body = await fs.readFileSync('./view/include/test.html');
}));