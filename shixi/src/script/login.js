	function $(id) {
		return document.getElementById(id);
	}

	var userId = $('userId'),
		  password = $('password'),
		  submit = $('submit'),
		  prompt = $('prompt');	

	submit.addEventListener('click', function(event) {
		if(!userId.value.length) {
			prompt.innerText = '用户名不能为空';
			event.preventDefault();
		}else if(password.value.length < 6) {
			prompt.innerText = '密码长度不合法';
			event.preventDefault();
		}
	}, false);