window.fn = {};

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

//Автопроверка обновлений
window.onload=function(){
	upd=localStorage.getItem("autoUpd");
	if(upd=="yes"){
		check4Updates("app");
	}
}

//Дополнительные параметры сокращения ссылки, реакция на свитч
function showAdditional(){
	if($("#additionalSwitch").children()[0].checked==false){
		$("#additionalParams").slideToggle(300);
	}else{
		requestAllCategories("short");
		$("#additionalParams").slideToggle(300);
	}
}

//сохранение выбора домена
function useDomain(domain){
	localStorage.setItem("useDomain",domain);
	hideDialog("chooseDomain");
}

//сохранение выбора папки
function useDir(id){
	localStorage.setItem("useDir",id);
	hideDialog("chooseDir");
}

//Удаление данных
function clearAllData(){
	ons.notification.confirm({message:'Вы уверены что хотите очистить все данные? В таком случае вам прийдется заново вводить API-ключ и настраивать приложение.',buttonLabels:["Нет","Да"]}).then(function(sure){
		if(sure==1){
			localStorage.clear();
			ons.notification.alert('Данные очищены. Приложение будет перезапущено.');
			location.href="index.html";
		}
  });	
}

//Светлая/темная тема оформления
function darkMode(){
	theme=localStorage.getItem("appTheme");
	if(theme=="dark"){
		localStorage.setItem("appTheme","light");
		$("#app-theme").attr("href","onsen/onsen-css-components.min.css");
	}else{
		localStorage.setItem("appTheme","dark");
		$("#app-theme").attr("href","onsen/dark-onsen-css-components.min.css");
	}
}

//Включение/выключение отображения пункта API в меню из настроек и применение результата без перезагрузки страницы
function apiInMenu(){
	APIstatus=localStorage.getItem("APIinMenu");
	if(APIstatus=="no"){
		localStorage.setItem("APIinMenu","yes");
		$("#APImenuItem").css("display","block");
	}else{
		localStorage.setItem("APIinMenu","no");
		$("#APImenuItem").css("display","none");
	}
}

//Включение/выключение доп.параметров
function needAdditional(){
	AdditionalStatus=localStorage.getItem("additional");
	if(AdditionalStatus=="no"){
		localStorage.setItem("additional","yes");
	}else{
		localStorage.setItem("additional","no");
	}
}

//Изменение API-ключа
function changeMyKey(){
	ons.notification.prompt({message:'Введите новый API-ключ',buttonLabels:["Отмена","Применить"]}).then(function(key){
		if(key!=null){
			if(key!=""){
				localStorage.setItem('q32apiuserskey',key);
				$("#showUserKey").html(key);
				ons.notification.alert("Новый ключ успешно сохранен!");
			}else{
				ons.notification.alert("Кажется вы оставили поле ввода пустым :( Ваш API-ключ не был изменен!");
			}
		}
  });
}

//Удаление API-ключа
function removeMyKey(){
	ons.notification.confirm({message:'Вы уверены что хотите удалить свой API-ключ из приложения?',buttonLabels:["Нет","Да"]}).then(function(sure){
		if(sure==1){
			localStorage.removeItem('q32apiuserskey');
			ons.notification.alert("Ваш API-ключ был удален!");
		}
  });
}

//Объект "папка" и массив для хранения этих объектов
function Category(id,name){
	this.id=id;
	this.name=name;
}
var dirlist=new Array();

//Объект "домен" и массив для их хранения
function userDomain(id,name){
	this.id=id;
	this.name=name;
}
allDomains=new Array();

//Запрос списка доменов
function requestDomains(){
	index=0;
	$.ajax({
			method:"GET",
			chache:false,
			crossDomain:true,
			timeout: 15000,
			url:"https://q32.link/api.php",
			data: "key="+localStorage.getItem("q32apiuserskey")+"&format=json"+"&action=get.domains",
			success:function(result){
				tmps=JSON.stringify(result.public);
				tempObj=JSON.parse(tmps,function(key,value){
					if(key!=null&&key!=""){
						allDomains[index]=new userDomain(key,value);
						index++;
					}
				});

				tmps=JSON.stringify(result.private);
				tempObj=JSON.parse(tmps,function(key,value){
					if(key!=null&&key!=""){
						allDomains[index]=new userDomain(key,value);
						index++;
					}
				});
				
				getDomainSelect();
			},
			error:function(result,stat,err){
				console.log(result);
				if(stat=="timeout"){
					ons.notification.alert("Таймаут запроса(15сек) истек, список доменов не загружен :(\n  Вероятно у Вас слишком медленное соединение или плохая связь.");
				}
				if(stat=="error"){
					ons.notification.alert("Список доменов не загружен, не вышло установить соедиение с сервером.");
				}
			},
			complete:function(stat,err){
				$("#wait-loading").css("display","none");
			}
		});	
}

//Отображение доменов в списке
function getDomainSelect(){
	list="";
	for(i=0;i<allDomains.length;i++){
		list+="<ons-list-item tappable id="+allDomains[i].id+" onclick='useDomain(this.id)'><ons-icon icon='md-cloud-outline' style='font-size:25px;padding-right:10px;'></ons-icon>"+allDomains[i].name+"</ons-list-item>";
	}
	$("#getDomainsSelect").html(list);
}

//Запрос списка папок
function requestAllCategories(target){
	var index=1;
	$.ajax({
			method:"GET",
			chache:false,
			crossDomain:true,
			dataType: "text",
			timeout: 15000,
			url:"https://q32.link/api.php",
			data: "key="+localStorage.getItem("q32apiuserskey")+"&format=json&action=get.categories",
			success:function(result){
				if(result!=""){
				jsn = JSON.parse(result, function(key,value){
					if(key!='' && key!=undefined && key!=null){
					dirlist[index]=new Category(key,value);
					index++;
					}
				});}
				dirlist[0]=new Category(0,"Без категории");
				$("#wait-loading").css("display","none");
				switch(target){
					case "settings":
						showSettingsCategories();
						break;
					case "short":
						getDirsSelect();
						requestDomains();
						break;
					case "mylinks":
						dirsInMyLinks();
						break;
				}
			},
			error:function(result,stat,err){
				console.log(result);
				if(stat=="timeout"){
					ons.notification.alert("Таймаут запроса(15сек) истек, список папок не загружен :(\n  Вероятно у Вас слишком медленное соединение или плохая связь.");
				}
				if(stat=="error"){
					ons.notification.alert("Список папок не загружен, не вышло установить соедиение с сервером.");
				}
			},
			complete:function(stat,err){
				$("#wait-loading").css("display","none");
			}
		});	
}

//отображение папок в настройках
function showSettingsCategories(){
	list="<ons-list-item tappable onclick='showDialog(0)'><ons-icon icon='md-folder-outline' style='font-size:25px;padding-right:10px;'></ons-icon>Без категории</ons-list-item>";
	list+="<ons-dialog id='0'><div style='text-align: center; padding: 10px;'><p>Папка \"Без категории\"<br>ID=0<br>Является стандартной, ее нельзя переименовать или удалить</p><p><ons-button onclick='hideDialog(0)'>Закрыть</ons-button></p></div></ons-dialog>";
	for(i=1;i<dirlist.length;i++){
		list+="<ons-list-item tappable onclick='showDialog("+dirlist[i].id+")'><ons-icon icon='md-folder-outline' style='font-size:25px;padding-right:10px;'></ons-icon>"+dirlist[i].name+"</ons-list-item>";
		list+="<ons-dialog id="+dirlist[i].id+"><div style='text-align: center; padding: 10px;'><p>Папка \""+dirlist[i].name+"\"<br>ID="+dirlist[i].id+"<hr><ons-fab onclick='renameDir("+dirlist[i].id+")' style='background-color:#2979ff;color:white;margin-right:10px'><ons-icon icon='md-edit'></ons-icon></ons-fab> или <ons-fab onclick='deleteDir("+dirlist[i].id+")' style='background-color:#2979ff;color:white;margin-left:10px'><ons-icon icon='md-delete'></ons-icon>		</ons-fab></p><p><ons-button onclick='hideDialog("+dirlist[i].id+")'>Закрыть</ons-button></p></div></ons-dialog>";
	}
	$("#ListOfDirs").html(list);
}

//отображение папок во всплывающем окне сокращения ссылки
function getDirsSelect(){
	list="<ons-list-item tappable onclick='useDir(0)'><ons-icon icon='md-folder-outline' style='font-size:25px;padding-right:10px;'></ons-icon>Без категории</ons-list-item>";
	for(i=1;i<dirlist.length;i++){
		list+="<ons-list-item tappable onclick='useDir("+dirlist[i].id+")'><ons-icon icon='md-folder-outline' style='font-size:25px;padding-right:10px;'></ons-icon>"+dirlist[i].name+"</ons-list-item>";
	}
	$("#getDirsSelect").html(list);
}

//отображение папок в "мои ссылки"
function dirsInMyLinks(){
	list="<ons-list-item tappable onclick='openDir(0,1,\"Без категории\")'><ons-icon icon='md-folder-outline' style='font-size:25px;padding-right:10px;'></ons-icon>Без категории</ons-list-item>";
	for(i=1;i<dirlist.length;i++){
		list+="<ons-list-item tappable onclick='openDir("+dirlist[i].id+",1)'><ons-icon icon='md-folder-outline' style='font-size:25px;padding-right:10px;'></ons-icon>"+dirlist[i].name+"</ons-list-item>";
	}
	$("#ListOfMyLinks").html(list);
}


var LinksInDir = new Array(); 

function userLinks(origlink,title,description,shortlink,linkid){
	this.origin=origlink;
	this.title=title;
	this.desc=description;
	this.shortl=shortlink;
	this.id=linkid;
}

function findDirTitle(id){
	title="";
	for(i=0;i<dirlist.length;i++){
		if(dirlist[i].id==id){
			return dirlist[i].name;
		}
	}
}

//Запрос ссылок
function openDir(dir,page){
	if(LinksInDir.length!=0){
		LinksInDir.splice(0,LinksInDir.length);
	}
	$("#wait-loading").css("display","block");
	$.ajax({
			method:"GET",
			chache:false,
			crossDomain:true,
			timeout: 15000,
			url:"https://q32.link/api.php",
			data: "key="+localStorage.getItem("q32apiuserskey")+"&format=json&action=get.links&folder="+dir+"&page="+page,
			success:function(result){
				size=result.links.length;
				total=result.total_page;
				if(size!=0){
					for(i=0;i<size;i++){
						lol=result.links[i].link;
						lsl=result.links[i].echo;
						lt=result.links[i].title;
						ld=result.links[i].description;
						lid=result.links[i].id;
						LinksInDir[i]=new userLinks(lol,lt,ld,lsl,lid);
					}
				}
				showLinks(page,total,dir);
			},
			error:function(result,stat,err){
				console.log(result);
				if(stat=="timeout"){
					ons.notification.alert("Таймаут запроса(15сек) истек, список ссылок не отображен :(\n  Вероятно у Вас слишком медленное соединение или плохая связь.");
				}
				if(stat=="error"){
					ons.notification.alert("Открыть папку не удалось, не вышло установить соедиение с сайтом приложения.");
				}
			},
			complete:function(stat,err){
				$("#wait-loading").css("display","none");
			}
		});			
}

//отображение ссылок
function showLinks(currentPage,totalPages,folder){
	title=findDirTitle(folder);
	$("#linksTitle").html(title);
	if(LinksInDir.length==0){
		$("#myLinksContent").html("В данной папке ссылок нет :(");
	}else{
		linkList="";
		dialogsList="";
		$("#myLinksContent").html("<ons-list id=\"ListOfMyLinks\"></ons-list>");
		$("#ListOfMyLinks").html(linkList);
		for(i=0;i<LinksInDir.length;i++){
				linkList+="<ons-list-item modifier='chevron' onclick='showDialog("+LinksInDir[i].id+")' tappable><div class='center'><span class='list-item__title'>"+LinksInDir[i].shortl+"</span><span class='list-item__subtitle'>"+LinksInDir[i].title.substring(0,29)+"...</span></div></ons-list-item>";
				dialogsList+="<ons-dialog id="+LinksInDir[i].id+"><div style='text-align: center; padding: 10px;max-width:250px;max-height:250px;word-wrap:break-word;overflow:scroll'><p>Короткая ссылка:<br>"+LinksInDir[i].shortl+"<br><ons-button onclick='copyToClipboard(\""+LinksInDir[i].shortl+"\")'>Скопировать</ons-button><br><br>Название:<br>"+LinksInDir[i].title+"<br><br>Описание:<br>"+LinksInDir[i].desc+"<br><br>Оригинальная ссылка:<br>"+LinksInDir[i].origin+"<br><ons-button onclick='copyToClipboard(\""+LinksInDir[i].origin+"\")'>Скопировать</ons-button><br><br></p></div><div style='text-align: center; margin-top: 5px;'><p><ons-button onclick='hideDialog("+LinksInDir[i].id+")'>Закрыть</ons-button></p></div></ons-dialog>";
			}
			var pageFabs="";
			if(currentPage==1 && (totalPages==0||totalPages==1)){
				pageFabs="";
			}
			if(currentPage>1 && currentPage<totalPages){
				pageFabs="<ons-fab position='bottom left' onclick=\"openDir("+folder+","+(currentPage-1)+")\"><ons-icon icon='md-chevron-left'></ons-icon></ons-fab>Стр. "+currentPage+" из "+totalPages+"<ons-fab position='bottom right'><ons-icon icon='md-chevron-right' onclick=\"openDir("+folder+","+(currentPage+1)+",'"+title+"')\"></ons-icon></ons-fab>";
			}
			if(currentPage==1 && totalPages>1){
				pageFabs="Стр. "+currentPage+" из "+totalPages+"<ons-fab position='bottom right'><ons-icon icon='md-chevron-right' onclick=\"openDir("+folder+","+(currentPage+1)+")\"></ons-icon></ons-fab>";
			}
			if(currentPage==totalPages && totalPages!=1){
				pageFabs="<ons-fab position='bottom left' onclick=\"openDir("+folder+","+(currentPage-1)+")\"><ons-icon icon='md-chevron-left'></ons-icon></ons-fab>Стр. "+currentPage+" из "+totalPages+"";
			}
		$("#ListOfMyLinks").html(linkList);
		$("#linksDialogs").html(dialogsList);
		$("#pageFabs").html(pageFabs);
	}
}

//Запрос создания папки
function createDir(){
	ons.notification.prompt({message:'Введите название новой папки',buttonLabels:["Отмена","Создать"]}).then(function(name){
		if(name!=null){
			if(name!=""){
				newName=encodeURIComponent(name);
				$.ajax({
					method:"GET",
					chache:false,
					crossDomain:true,
					timeout: 15000,
					url:"https://q32.link/api.php",
					data: "key="+localStorage.getItem("q32apiuserskey")+"&format=json&action=add.category&title="+newName,
					success:function(result){
						if(result.category!=null){
							requestAllCategories("settings");
						}
					},
					error:function(result,stat,err){
						console.log(result);
						if(stat=="timeout"){
							ons.notification.alert("Таймаут запроса(15сек) истек, папка не создана  :(\n  Вероятно у Вас слишком медленное соединение или плохая связь.");
						}
						if(stat=="error"){
							ons.notification.alert("Создание папки не удалось, не вышло установить соедиение с сайтом приложения.");
						}
					},
					complete:function(stat,err){
						$("#wait-loading").css("display","none");
					}
				});	
			}else{
				ons.notification.alert("Кажется вы оставили поле ввода пустым :( Папку без названия создать нельзя!");
			}
		}
  });
}

//Запрос переименования папки
function renameDir(id){
	ons.notification.prompt({message:'Введите новое название папки',buttonLabels:["Отмена","Переименовать"]}).then(function(name){
		if(name!=null){
			if(name!=""){
				newName=encodeURIComponent(name);
				$.ajax({
					method:"GET",
					chache:false,
					crossDomain:true,
					timeout: 15000,
					url:"https://q32.link/api.php",
					data: "key="+localStorage.getItem("q32apiuserskey")+"&format=json&action=edit.category&id="+id+"&title="+newName,
					success:function(result){
							if(result.category!=null){
								requestAllCategories("settings");
							}
					},
					error:function(result,stat,err){
						console.log(result);
						if(stat=="timeout"){
							ons.notification.alert("Таймаут запроса(15сек) истек, папка не переименована :(\n  Вероятно у Вас слишком медленное соединение или плохая связь.");
						}
						if(stat=="error"){
							ons.notification.alert("Переименование не удалось, не вышло установить соедиение с сайтом приложения.");
						}
					},
					complete:function(stat,err){
						$("#wait-loading").css("display","none");
					}
				});	
			}else{
				ons.notification.alert("Кажется вы оставили поле ввода пустым :( Оставить папку без названия нельзя!");
			}
		}
  });
}

//Запрос удаления папки
function deleteDir(id,index){
	ons.notification.confirm({message:'Вы уверены что хотите удалить данную папку? Вместе с папкой будут так же удалены и все ссылки которые в ней находятся!',buttonLabels:["Нет","Да"]}).then(function(sure){
		if(sure==1){
			$.ajax({
				method:"GET",
				chache:false,
				crossDomain:true,
				timeout: 15000,
				url:"https://q32.link/api.php",
				data: "key="+localStorage.getItem("q32apiuserskey")+"&format=json&action=remove.category&id="+id,
				success:function(result){
					if(result.status=="Success"){
						dirlist.splice(index,1);
						requestAllCategories("settings");
					}
				},
				error:function(result,stat,err){
					console.log(result);
					if(stat=="timeout"){
						ons.notification.alert("Таймаут запроса(15сек) истек, Удалить папку не удалось :(\n  Вероятно у Вас слишком медленное соединение или плохая связь.");
					}
					if(stat=="error"){
						ons.notification.alert("Проголосовать не получилось, не вышло установить соедиение с сайтом приложения.");
					}
				},
				complete:function(stat,err){
					$("#wait-loading").css("display","none");
				}
			});	
		}
  });
}

//сокращение ссылки
function shortIt(){
	$(function(){
		enteredLink=$("#fullLink")[0].children[0].value;
		urlkeys="key="+localStorage.getItem('q32apiuserskey');
		if(enteredLink!=""){
			original=encodeURIComponent(enteredLink);
			urlkeys+="&url="+original+"&format=json";
			
			$("#wait-loading").css("display","block");
			
			if($("#additionalSwitch")[0].children[0].checked==true){

				if($("#nameLink")[0].children[0].value!=""){
					name=encodeURIComponent($("#nameLink")[0].children[0].value);
					urlkeys+="&title="+name;
				}
				
				if($("#descLink")[0].children[0].value==""){
					desc=encodeURIComponent("Описания нет");
				}else{
					desc=encodeURIComponent($("#descLink")[0].children[0].value);
				}
				urlkeys+="&description="+desc;
				domain=localStorage.getItem("useDomain");
				if(domain!=null){
					urlkeys+="&domain="+domain;
				}
				dir=localStorage.getItem("useDir");
				if(dir!=null){
					urlkeys+="&folder="+dir;
				}
			}
			$.ajax({
				method:"GET",
				chache:false,
				crossDomain:true,
				timeout: 15000,
				url:"https://q32.link/api.php",
				data: urlkeys,
				success:function(result){
					rst=JSON.parse(result);
					$("#short").css("display","block");
					$("#shortenedLink").html(rst.short_link);
					localStorage.removeItem("useDir");
					localStorage.removeItem("useDomain");
					$("#wait-loading").css("display","none");
				},
				error:function(result,stat,err){
					console.log(result);
					if(stat=="timeout"){
						ons.notification.alert("Таймаут запроса(15сек) истек. Сократить вашу ссылку не получилось :(");
					$("#wait-loading").css("display","none");
					localStorage.removeItem("useDir");
					localStorage.removeItem("useDomain");
					}
					if(stat=="error"){
						ons.notification.alert("Ссылка не сокращена, не удалось установить соединение с сервером");
					}
				},
				complete:function(stat,err){
					$("#wait-loading").css("display","none");
				}
			});
		}else{
			ons.notification.alert("Укажите ссылку которую надо сохранить!");
		}
	});
}

//Преобразование JSON-списка фич в массив
function localFeaturesArray(){
	points=new Array();
	pIndex=0;
	ELS=localStorage.getItem("ListOfFeatures");
	if(ELS!==null){
		existList=new Array();
		existList=ELS.split(",");	
	}else{
		existList=new Array();
	}
	return existList;
}

//Сравнение загруженного JSON-списка фич и сохраненного в приложении массива для обновления списка
function clearDifference(newL){
	existL=localFeaturesArray();
	for(i=0;i<existL.length;i++){
		needSave=false;
		for(j=0;j<newL.length;j++){
			if(existL[i]==newL[j]){
				needSave=true;
			}
		}
		if(needSave==false){
			if(localStorage.getItem(existL[i])!=null){
				localStorage.removeItem(existL[i]);
			}
		}
	}
	localStorage.setItem("ListOfFeatures",newL);
}

//загрузка с сервера планируемых фич
function getFutureVotes(){
	$("#wait-loading").css("display","block");
	
	$.ajax({
			method:"GET",
			chache:false,
			crossDomain:true,
			timeout: 15000,
			url:"https://rj-l.000webhostapp.com/q32/4future.php",
			data: "forThe=app",
			success:function(result){
				$("#featureContent").html(result);
				featuresList=$("#json-list").html();
				list4LS=JSON.parse(featuresList);
				clearDifference(list4LS.features);
				checkVotes();
			},
			error:function(result,stat,err){
				console.log(result);
				if(stat=="timeout"){
					ons.notification.alert("Таймаут запроса(15сек) истек, список не загружен :(\n  Вероятно у Вас слишком медленное соединение или плохая связь.");
				}
				if(stat=="error"){
					ons.notification.alert("Ошибка загрузки, не вышло установить соедиение с сайтом приложения.");
				}
			},
			complete:function(stat,err){
				$("#wait-loading").css("display","none");
			}
		});	
}

//вернуть голос
function gbVote(id){
	chs=localStorage.getItem(id);
	vote(chs,id,true);
}

//проверка наличия голосов за фичи
function checkVotes(){
	el=localFeaturesArray();
	for(i=0;i<el.length;i++){
		var ftr=el[i];
		buttons='#'+ftr+"-buttons";
		gbv='#'+ftr+"-return";
		elvote=localStorage.getItem(ftr);
		if(elvote!=null){
			$(buttons).css("display","none");
			uc="Вы проголосовали ";
			if(elvote=="up"){
				uc+="ЗА<br>";
			}else{
				uc+="ПРОТИВ<br>";
			}
			uc+=$(gbv).html();
			$(gbv).html(uc);
			$(gbv).css("display","block");
		}
	}
}

//Запрос Голосование (revote=true возврат голоса)
function vote(UpDown,futureName,revote){
	c=encodeURIComponent(UpDown);
	n=encodeURIComponent(futureName);
		
	$.ajax({
			method:"GET",
			chache:false,
			crossDomain:true,
			timeout: 15000,
			url:"https://rj-l.000webhostapp.com/q32/votes/"+((revote==true)?"revote.php":"vote.php"),
			data: "future="+n+"&choise="+c,
			success:function(result){
				ons.notification.alert(result);
				if(revote==true){
					localStorage.removeItem(futureName);
				}else{
					localStorage.setItem(futureName,UpDown);
				}
				hideDialog(futureName);
				getFutureVotes();
			},
			error:function(result,stat,err){
				console.log(result);
				if(stat=="timeout"){
					ons.notification.alert("Таймаут запроса(15сек) истек, проголосовать не получилось :(\n  Вероятно у Вас слишком медленное соединение или плохая связь.");
					hideDialog(futureName);
				}
				if(stat=="error"){
					ons.notification.alert("Проголосовать не получилось, не вышло установить соедиение с сайтом приложения.");
				}
			},
			complete:function(stat,err){
				$("#wait-loading").css("display","none");
			}
		});	
}

//Загрузка страницы "Что нового"
function whatsNew(){
	showDialog("what-new");
	$("#wait-loading").css("display","block");
	$("#newsText").html("");
	date=new Date();
	$.ajax({
			method:"GET",
			chache:false,
			crossDomain:true,
			timeout: 15000,
			url:"https://rj-l.000webhostapp.com/q32/whatsnew.php",
			data: date,
			success:function(result){
				$("#newsText").html(result);
			},
			error:function(result,stat,err){
				console.log(result);
				if(stat=="timeout"){
					ons.notification.alert("Превышено время ожидания ответа. Вероятно у Вас слишком медленное соединение или плохая связь.");
				}
				if(stat=="error"){
					ons.notification.alert("Не удается загрузить список изменений. Не вышло установить соедиение с сайтом приложения.");
				}
			},
			complete:function(stat,err){
				$("#wait-loading").css("display","none");
			}
		});		
}

//Проверка обновлений, asked - параметр для разделения автопроверки и пользователя, воизбежание ненужных уведомлений об актуальности приложения если у пользователя последняя версия
function check4Updates(asked){
	ver=$("#appVer").text();
	$.ajax({
			method:"GET",
			chache:false,
			crossDomain:true,
			timeout: 15000,
			url:"https://rj-l.000webhostapp.com/q32/latest.php",
			data: "askFrom="+ver,
			success:function(result){
				if((result=="У вас последняя версия приложения :)")&&(asked=="app")){
					
				}else{
					ons.notification.alert(result);
				}
			},
			error:function(result,stat){
				if(stat=="timeout"){
					ons.notification.alert("Таймаут запроса(15сек) истек, обновления не проверены :(\n  Вероятно у Вас слишком медленное соединение или плохая связь.");
					hideDialog(futureName);
				}
				if(stat=="error"){
					ons.notification.alert("Не удалось проверить обновления, не вышло установить соедиение с сайтом приложения.");
				}
			},
			complete:function(stat,err){
				
			}
		});
}

//Запись параметра автообновлений
function autoUpdate(){
	if(localStorage.getItem("autoUpd")=="yes"){
		localStorage.setItem("autoUpd","no");
	}else{
		localStorage.setItem("autoUpd","yes");
	}
}

