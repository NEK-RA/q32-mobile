window.fn = {};

window.fn.open = function() {
  var menu = document.getElementById('menu');
  menu.open();
};

window.fn.load = function(page) {
  var content = document.getElementById('content');
  var menu = document.getElementById('menu');
  content.load(page)
    .then(menu.close.bind(menu));
};

window.onload=function(){	
	if(localStorage.getItem("welcome-progress")==null){
		localStorage.setItem("welcome-progress","0");
	}
	checkMenu();
}

var showDialog = function (id) {
  document
    .getElementById(id)
    .show();
};

var hideDialog = function (id) {
  document
    .getElementById(id)
    .hide();
};

//установка прогресса первого запуска
function setProgress(page){
	if(page=="welcome"){
		if(localStorage.getItem("welcome-progress")<25)
		{localStorage.setItem("welcome-progress",25);}
	}
	if(page=="novice"){
		if(localStorage.getItem("welcome-progress")<50)
		{localStorage.setItem("welcome-progress",50);}
	}
	if(page=="API"){
		if(localStorage.getItem("welcome-progress")<75)
		{localStorage.setItem("welcome-progress",75);}
	}
	if(page=="final"){
		if(localStorage.getItem("welcome-progress")<100)
		{localStorage.setItem("welcome-progress",100);}
	}
}

//Отображение пунктов меню по мере прогресса
function checkMenu(){
	progres=localStorage.getItem("welcome-progress");
	if(progres==0 || progres==25){
		$("#progres25").css("background-color","orange");
		$("#progres50").css("display","none");
		$("#progres75").css("display","none");
		$("#progres100").css("display","none");
	}
	if(progres==50){
		$("#progres25").css("background-color","white");
		$("#progres50").css({"background-color":"orange","display":"block"});
		$("#progres75").css("display","none");
		$("#progres100").css("display","none");
	}
	if(progres==75){
		$("#progres25").css("background-color","white");
		$("#progres50").css("background-color","white");
		$("#progres75").css({"background-color":"orange","display":"block"});
		$("#progres100").css("display","none");
	}
	if(progres==100){
		$("#progres25").css("background-color","white");
		$("#progres50").css("background-color","white");
		$("#progres50").css("background-color","white");
		$("#progres100").css({"background-color":"orange","display":"block"});
	}
}

//Ввод пользовательского API-ключа и проверка его на сервере
function getAPI(){
	ons.notification.prompt({message:'Введите ваш API-ключ',buttonLabels:["Отмена","Проверить"]}).then(function(key){
		if(key!=""){
			if(key!=null){
				$("#wait-loading").css("display","block");
				$.ajax({
					method:"GET",
					chache:false,
					crossDomain:true,
					timeout: 15000,
					url:"https://q32.link/api.php",
					data:"key="+key,
					success:function(result){
						if(result!="error: API key not valid"){
							localStorage.setItem("q32apiuserskey",key);
							$("#continue-button").css("display","block");
							ons.notification.alert("Проверка ключа прошла успешно! Вы можете продолжить настройку приложения!");
						}else{
							ons.notification.alert("API-ключ введен неверно. Попробуйте вновь скопировать ключ с сайта, возможно вы зацепили лишний символ или скопировали ключ не полностью.");
						}
					},
					error:function(result,stat,err){
						console.log(result);
						//описать result.readyState и result.status
						if(stat=="timeout"){
							ons.notification.alert("Превышено время ожидания ответа. Вероятно у Вас слишком медленное соединение или плохая связь.");
						}
						if(stat=="error"){
							ons.notification.alert("Не удается установить соединение с сервером, проверьте наличие интернет-соединения.");
						}
					},
					complete:function(stat,err){
						$("#wait-loading").css("display","none");
					}
				});
			}
		}else{
			ons.notification.alert("Ключ не был введен!");
		};
	});
}

//Завершение настройки
function finalSetup(){
	localStorage.setItem("additional","no");
	localStorage.setItem("isFirstStart?","no");
	localStorage.setItem("autoUpd","yes");
	if($("#APISwitch").children()[0].checked==true){
		localStorage.setItem("APIinMenu","yes");
	}else{
		localStorage.setItem("APIinMenu","no");
	};
	if($("#darkModeSwitch").children()[0].checked==true){
		localStorage.setItem("appTheme","dark");
	}else{
		localStorage.setItem("appTheme","light");
	};
	location.href="index.html";
}