Zepto(function($){
	// 方法
	var utils = {
		adapter: function() {
			var dpr, rem, scale;
			var docEl = document.documentElement;
			var fontEl = document.createElement('style');
			var metaEl = document.querySelector('meta[name="viewport"]');
			var device = docEl.clientWidth < docEl.clientHeight ? docEl.clientWidth : docEl.clientHeight;
			dpr = window.devicePixelRatio || 1;
			rem = device * dpr / 10;
			scale = 1 / dpr;
			// 设置viewport，进行缩放，达到高清效果
			metaEl.setAttribute('content', 'width=' + dpr * device + ',initial-scale=' + scale + ',maximum-scale=' + scale + ', minimum-scale=' + scale + ',user-scalable=no');
			// 设置data-dpr属性
			docEl.setAttribute('data-dpr', dpr);
			// 动态写入样式
			docEl.firstElementChild.appendChild(fontEl);
			fontEl.innerHTML = 'html{font-size:' + rem + 'px!important;}';
		},
		prevent: function() {
			// 避免字体选中和触发自定义菜单  但是会使自动滑动消失
			document.addEventListener('touchstart', function (event) {
			  // 判断默认行为是否可以被禁用
		    if (event.cancelable) {
		        // 判断默认行为是否已经被禁用
		        if (!event.defaultPrevented) {
		            event.preventDefault();
		        }
		    }
		    event.preventDefault();
			}, false);
		},
		show: function() {
			for(var key in arguments) {
				arguments[key].show();
			}
		},
		hide: function() {
			for(var key in arguments) {
				arguments[key].hide();
			}
		},
		showChapters: function() {},
		showLightSetting: function() {},
		setTheme: function(theme) {},
		showSetting: function() {},
		tabChange: function(container, index) {
			var ol = container.find('ol');
			var ul = $(container.find('ul')[0]);
			var indexLength = ul.get(0).childElementCount;
			index = index || 0;

			// 动态生成圆点索引
			if(ol.length) {
				console.log('生成索引');
				for(var i = 1; i <= indexLength; i++) {
					ol.html(ol.html() + '<li>' + i + '</li>');
				}
				//ol.find('li').hide();
				// 获取width  需等到界面渲染完后  才能得到准确值  根据圆点多少适配位置变化
				ol.css('margin-left', (-ol.width()/2) + 'px');
			}

			// tab的索引  索引下标的动画效果
			ul.css('transition', 'transform .3s cubic-bezier(.12,.85,.39,1.01)');
			
			container.on('touchstart', function(event) {
				event.stopPropagation ? event.stopPropagation() : (event.cancelBubble=true);
			});
			container.on('touchmove', function(event) {
				event.stopPropagation ? event.stopPropagation() : (event.cancelBubble=true);
			});
			container.on('touchend', function(event) {
				event.stopPropagation ? event.stopPropagation() : (event.cancelBubble=true);
			});
			container.swipeLeft(function (event) {
				event.stopPropagation ? event.stopPropagation() : (event.cancelBubble=true);
				if(index !== indexLength-1) {
					index++;
					ul.css('transform', 'translate3d(-' + 100/indexLength*index + '%, 0, 0)');
				}
			});
			container.swipeRight(function(event) {
				event.stopPropagation ? event.stopPropagation() : (event.cancelBubble=true);
				if(index !== 0) {
					index--;
					ul.css('transform', 'translate3d(-' + 100/indexLength*index + '%, 0, 0)');
				}
			});
		},
		save: function(key, value) {
			localStorage.setItem(key, JSON.stringify(value));
		},
		getStorage: function(key) {
			if(localStorage.getItem(key)) {
				return JSON.parse(localStorage.getItem(key));
			}else {
				return null;
			}
		},
		clearStorage: function() {
			localStorage.clear();
		},
		getTransform(el) {
			/*			// transform: matrix()
			$(el).css('transform', 'translate3d(0,0,0');
			setTimeout(function() {
			var matrix = document.defaultView.getComputedStyle(el, null).transform;
				console.log(matrix);
			}, 3000);

			return {
				translateX: x,
				translateY: y,
				translateZ: z,
				translate3d: '(' + x + ',' + y + ',' + z + ',' + ')',
				rotateX: rotateX,
				rotateY: rotateY,
				rotateZ: rotateZ,
				rotateX: rotateX,
			}*/
		},
		setTransform() {

		},

		bestScroll: function($outer) {
			var lastMoveTime = 0;  
			var lastMoveStart = 0;  
			var stopInertiaMove = false; // 是否停止缓动

			var $inner = $outer.children(),
					start = 0,
					startTop = $inner.offset().top,
					nowTop = startTop;
				$inner.css('transform', 'translate3d(0,0,0)');

			$outer.on('touchstart', function(event) {
				start = event.touches[0].pageY;
				nowTop = $inner.offset().top - startTop;

				lastMoveStart = $inner.offset().top;  
		    lastMoveTime = Date.now();  
		    stopInertiaMove = true;
			});

			$outer.on('touchmove', function(event) {
				if($inner.offset().top > startTop) {
					start = event.touches[0].pageY;
					$inner.css('transform', 'translate3d(0, 0, 0');
					return;
				}else if($inner.offset().height + $inner.offset().top < $outer.offset().height) {
					start = event.touches[0].pageY;
					$inner.css('transform', 'translate3d(0, ' + ($outer.offset().height - $inner.offset().height - startTop) + 'px, 0)');
					return;
				}else {
					if($inner.offset().top === startTop && event.touches[0].pageY - start > 0) {
						start = event.touches[0].pageY;
						return;
					}else if($inner.offset().height + $inner.offset().top === $outer.offset().height && event.touches[0].pageY - start < 0) {
						start = event.touches[0].pageY;
						return;
					}
					$inner.css('transform', 'translate3d(0, ' + (nowTop + event.touches[0].pageY - start) + 'px, 0)');
				}

				var nowTime = Date.now();  
		    stopInertiaMove = true;  
		    if(nowTime - lastMoveTime > 50) {
		    		//console.log('过了300ms');
		        lastMoveTime = nowTime;
		        lastMoveStart = $inner.offset().top;
		    }
			});

			$outer.on('touchend', function(e) {
        var nowTime = Date.now();
		    var v = ($inner.offset().top - lastMoveStart) / (nowTime - lastMoveTime); //最后一段时间手指划动速度  
		    //console.log('v最开始    ' + v);
		    stopInertiaMove = false;
		    (function(v, startTime, contentY) {
		        var dir = v > 0 ? -1 : 1; //加速度方向
		        var deceleration = dir*0.0006;
		        /*var duration = v / deceleration; // 速度消减至0所需时间  
		        var dist = v * duration / 2; //最终移动多少*/
		        function inertiaMove() {
		            if(stopInertiaMove) {
		            	return;
		            }  
		            var nowTime = Date.now();
		            var t = nowTime-startTime;
		            
		            //console.log('------------------------------');
		            ////console.log('nowTime    ' + nowTime);
		            ////console.log('startTime  ' + startTime);
		            //console.log('t          ' + t);
		            //console.log('v          ' + v);

		            var nowV = v + t*deceleration;
		            //console.log('nowV       ' + nowV);
		            // 速度方向变化表示速度达到0了  
		            if(dir*nowV >= 0) {
		            	//console.log('速度方向变化');
		              stopInertiaMove = true;
		              return;
		            }  
		            	//console.log('offsetTop   ' + $inner.offset().top);
		            	//console.log('startTop   ' + startTop);
		            if($inner.offset().top > startTop) {
		            	//alert('不能上了')
        					$inner.css('transform', 'translate3d(0, 0, 0)');
        					stopInertiaMove = true;
		            }else if($inner.offset().height + $inner.offset().top < $outer.offset().height) {
									////console.log('不能下了');
									$inner.css('transform', 'translate3d(0, ' + ($outer.offset().height - $inner.offset().height - startTop) + 'px, 0)');
									stopInertiaMove = true;
		            }else {
				            var moveY = (v + nowV)/2 * t;
					          $inner.css('transform', 'translate3d(0, '+(contentY + moveY)+'px, 0)');
					          setTimeout(inertiaMove, 5);
					          //console.log('moveY    ' + moveY);
					          //alert('最终 ' + $inner.offset().top);
		            }
		        }
		        inertiaMove();  
		    })(v, lastMoveTime, $inner.offset().top-startTop); 
			});
		},

		initShow: function(dom, fn) {
			var cssinit = dom.css('margin-left');
			dom.css('margin-left', '10000px');
			dom.show();
			fn();
			dom.hide();
			dom.css('margin-left', cssinit);
		},

		chaptersToggle: function($outer) {
			var $inner = $outer.children(),
					minWidth = $outer.offset().width,
					t = $outer.css('background-color'),
					trans =	parseFloat(t.split(',')[3].slice(0, -1))/minWidth;
			var start = 0;

			$outer.on('touchstart', function(event) {
				start = event.touches[0].pageX;
				/*				console.log('----------------------------------------');
				console.log('start:    ' + start);
				console.log('minWidth:    ' + minWidth);*/
			});

			$outer.on('touchmove', function(event) {
				//console.log('----------------------------------------');
				var now = event.touches[0].pageX,
						dis = start - now;
				//console.log('now-start:    ' + (now-start));
				if(start - now < 0) {
					return;
				}
				// 手动滑到边缘
				if((-dis) >= $inner.offset().width) {
					$inner.css('transform', 'translate3d('+(-dis)+'px, 0, 0)');
					$outer.css('background-color', 'rgba(0, 0, 0,'+trans*(minWidth-dis)+')');
					$outer.hide();
					$inner.css('transition', 'transform .3s cubic-bezier(.12,.85,.39,1.01)');
					$inner.css('transform', 'translate3d(0, 0, 0)');
					$outer.css('transition', 'background-color .3s cubic-bezier(.12,.85,.39,1.01)');
					$outer.css('background-color', t);
					return;
				}
				$inner.css('transform', 'translate3d('+(-dis)+'px, 0, 0)');
				$outer.css('background-color', 'rgba(0, 0, 0,'+trans*(minWidth-dis)+')');
			});
			$outer.on('touchend', function(event) {
				var end = event.changedTouches[0].pageX;
				console.log('end-start:    ' + (end-start));
				if(start - end < 0) {
					return;
				}
				if(start - end > minWidth/3) {
					console.log('可以自动隐藏了');
					// 自动移动隐藏   自动修改透明度隐藏
					$inner.css('transition', 'transform .3s cubic-bezier(.12,.85,.39,1.01)');
					$inner.css('transform', 'translate3d('+(-$inner.offset().width)+'px, 0, 0)');
					$outer.css('transition', 'background-color .3s cubic-bezier(.12,.85,.39,1.01)');
					$outer.css('background-color', 'rgba(0,0,0,0)');
					setTimeout(function() {
						$outer.hide();
						console.log('退回');
						//$inner.css('transition', 'transform .3s cubic-bezier(.12,.85,.39,1.01)');
						$inner.css('transform', 'translate3d(0, 0, 0)');
						//$outer.css('transition', 'background-color .3s cubic-bezier(.12,.85,.39,1.01)');
						$outer.css('background-color', t);
					}, 300);
				}else {
					console.log('退回');
					$inner.css('transition', 'transform .3s cubic-bezier(.12,.85,.39,1.01)');
					$inner.css('transform', 'translate3d(0, 0, 0)');
					$outer.css('transition', 'background-color .3s cubic-bezier(.12,.85,.39,1.01)');
					$outer.css('background-color', t);
				}
			});
		}
	};

	// 主题
	var theme = {
		'rgb(245, 244, 240)': '#3D3D3D',
		'rgb(214, 202, 171)': '#3B352C',
		'rgb(58, 53, 49)': '#95938F',
		'rgb(204, 232, 207)': '#3D3D3D',
		'rgb(0, 28, 41)': '#204353'
	}

  // 初始化
  init();

  // 初始化函数
  function init() {
  	utils.adapter();      // 适配
  	utils.prevent();      // 阻止默认事件
  	var dom = getDom();   // 获取dom
  	getLocalSetting(dom); // 加载用户设置
  	requestData(dom, dom.book_id, dom.chapter_num);   // 数据请求
  	requestChapter(dom, dom.book_id);   // 数据请求
  	bindEvents(dom);      // 绑定事件
  }

	// 获取dom
	function getDom() {
		var dom = {};
		dom.$read_content = $('#read_content');
		dom.$read_content_wrapper = $('.read-content-wrapper');
		dom.$bottom = $('.bottom');
		dom.$top = $('.top');
		dom.$pen = $('.pen');
		dom.$bottom = $('.bottom');
		// 目录
		dom.$chapters = $('.chapters');
		dom.$tabContentWrapper = $('.tab-content-wrapper');
		dom.$tabContent = $('.tab-content');  // 左右滑  内容区左右走
		dom.$chaptersContent = $('.chapter-content');   // 内容区  上下滑
		dom.$chaptersMask = $('.chapters-mask');    // 
		// 亮度
		dom.$lightSetting = $('.light-setting');
		// 设置
		dom.$settingContent = $('.setting-page-wrapper');
		dom.$fontSizeText = $('.font-size-text');

		return dom;
	}

	// 绑定事件
	function bindEvents(dom) {
		var config = dom.readConfig;
		// 横竖屏reload
		window.addEventListener('orientationchange', function() {
			window.location.reload();
		});
		// 阅读单击滑动事件逻辑
		dom.$read_content.tap(function() {
			if(dom.$top.css('display') !== 'none') {
				utils.hide(dom.$top, dom.$pen, dom.$bottom, dom.$settingContent);
			}else {
				utils.show(dom.$top, dom.$pen, dom.$bottom);
			}
		});
		dom.$read_content.swipe(function() {
			utils.hide(dom.$top, dom.$pen, dom.$bottom, dom.$settingContent);
		});

		var firstSettingFlag = false;
		// 底部菜单代理
		dom.$bottom.on('tap', function(event) {
			var $target = $(event.target);
			if($target.parent('.chap').length || $target.is('.chap')) {
				// 显示章节  隐藏所有设置
				utils.show(dom.$chaptersMask);
				utils.hide(dom.$top, dom.$pen, dom.$bottom);
			}else if($target.parent('.light').length || $target.is('.light')) {
				alert('显示灯光');

			}else if($target.parent('.moon').length || $target.is('.moon')) {
				if(config.isLight) {
					dom.$read_content.css('background-color', '#001622');
					dom.$read_content.css('color', '#204353');
					config.isLight = false;
				}else {
					dom.$read_content.css('background-color', config.backgroundColor);
					if(theme[config.backgroundColor]) {
						dom.$read_content.css('color', theme[config.backgroundColor]);
					}
					config.isLight = true;
				}
			}else if($target.parent('.sett').length || $target.is('.sett')) {
				utils.show(dom.$settingContent);
				utils.hide(dom.$top, dom.$pen, dom.$bottom);
				if(!firstSettingFlag) {
					// 设置切换动画
					utils.tabChange(dom.$settingContent);
					firstSettingFlag = true;
				}
			}
		});

		// 设置页代理
		dom.$settingContent.on('tap', function(event) {
			var $target = $(event.target);
					id = $target.get(0).id;
					//console.log($target)
					//console.log(id)
			if($target.parent('.font-smaller-setting').length || $target.is('.font-smaller-setting')) {
				console.log(event.target);
				if(config.fontSize / config.rem > 0.4) {
					config.fontSize -= 4;
					dom.$fontSizeText.html(config.fontSize);
				  dom.$read_content.css('font-size', config.fontSize + 'px');	
				}
			}else if($target.parent('.font-bigger-setting').length || $target.is('.font-bigger-setting')) {
				if(config.fontSize / config.rem < 1) {
					config.fontSize += 4;
					dom.$fontSizeText.html(config.fontSize);
				  dom.$read_content.css('font-size', config.fontSize + 'px');
				}
			}else if($target.parent('.font-style-setting').length) {

			}else if($target.parent('.font-family-setting').length) {

			}else if($target.parent('.bgc-setting').length) {
				// 背景设置
				if($target.is('.bgc-more')) {
					// 显示更多颜色设置
					return;
				}
				// 主题
				config.isLight = true;
				config.backgroundColor = $target.css('background-color');
				dom.$read_content.css('background-color', config.backgroundColor);
				if(theme[config.backgroundColor]) {
					dom.$read_content.css('color', theme[config.backgroundColor]);
				}
			}
		});

		dom.$chaptersContent.on('tap', function(event) {
			// 代理
			//var x = event.target.
		});

		// 页面卸载时  记录localStorage
		$(window).on('unload', function() {
			//utils.save('readConfig', config);
			//utils.save('bookDate', dom.bookDate);
		});
	}

	function initReadConfig(dom) {
		dom.readConfig = {};
		var config = dom.readConfig;
		config.style = {};
		config.fontSize = parseInt(dom.$read_content.css('font-size').slice(0, -2));
		config.fontFamily = dom.$read_content.css('font-family');				
		config.backgroundColor = dom.$read_content.css('background-color');
		config.fontSpaceStyle = 1;   // 默认是风格1
		config.togglePageStyle = 1;   //默认翻页方式
		config.chapters = 3;   // 关闭前记录
		config.progress = 0;   // 进度  当前除以总的  可试着scrollTop
		config.book_id = 1;
		config.isLight = true;
		// 浏览器端用的  后期删除
		config.rem = parseInt($('html').css('font-size').slice(0, -2));
		dom.$fontSizeText.html(config.fontSize);
	}

	// 浏览器存储
	function getLocalSetting(dom) {
/*		if(utils.getStorage('readConfig')) {
			dom.readConfig = utils.getStorage('readConfig');
			// bookData中有  书签 当前章节 当前看书位置 笔记
			dom.bookDate = utils.getStorage(dom.readConfig.book_id);
		}else {
		}*/
			initReadConfig(dom);
		dom.book_id = dom.readConfig ? dom.readConfig.book_id : 1;
		dom.chapter_num = dom.bookDate ? dom.bookDate.chapter_num : 3;
	}

	// 数据请求
	function requestData(dom, book_id, chapter_num) {
		$.ajax({
	  	type: 'GET',
	  	url: '/readcontent',
	  	data: { book_id: book_id, chapter_num: book_id },
	  	dataType: 'html',
	  	timeout: 300,
	  	success: function(data) {
	  		dom.$read_content.html(data);
	  		utils.bestScroll(dom.$read_content_wrapper);
	  	},
	  	error: function(){
		    dom.$read_content.html('请求出错，请刷新重试...');
		  }
	  });
	}	

	// 进入页面首先请求内容  再请求章节
	function requestChapter(dom, book_id) {
		$.ajax({
	  	type: 'GET',
	  	url: '/chapters',
	  	data: { book_id: book_id },
	  	dataType: 'html',
	  	timeout: 300,
	  	success: function(data) {
	  		dom.$chaptersContent.html(data);
	  		utils.initShow(dom.$chaptersMask, function() {
	  			utils.bestScroll(dom.$chaptersContent);
	  			utils.tabChange(dom.$tabContentWrapper, 2);
					utils.chaptersToggle(dom.$chaptersMask);
	  		});

	  	},
	  	error: function(){
	  		dom.$chaptersContent.html('请求出错');
		  }
	  });
	}
});
