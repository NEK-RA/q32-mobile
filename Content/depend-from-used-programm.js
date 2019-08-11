function copyToClipboard(someText){
	if(someText!="shortLink"){
		//метод для копирования в буфер обмена от Serakont App Builder 2
		android.clipboard.setText(someText);
		//метод от него же для отображения "тостов"
		android.toast.show("Скопировано!");
	}else{
		shortLink=document.getElementById("shortenedLink").innerHTML;
		android.clipboard.setText(shortLink);
		android.toast.show("Короткая ссылка скопирована!");
	}
}

// Функция открытия "предыдущей страницы", почти не зависит того в чем идет сборка
function goBack(){
	currentPlace=document.getElementById("content").page;

	if(currentPlace=="short.html"){
			ons.notification.confirm({message:"Закрыть приложение?",buttonLabels:["Нет","Да"]}).then(function(sure){
				if(sure==1){
					android.activity.finish(); //Закрытие приложения по API Serakont App Builder
				}
			});
	}
	
	if (currentPlace=="links.html" || currentPlace=="settings.html" || currentPlace=="help.html" || currentPlace== "api.html"){
		fn.load("short.html");
	}
	if(currentPlace=="novice.html" || currentPlace=="faq.html" || currentPlace=="about.html" || currentPlace=="feedback.html"){
		fn.load("help.html");
	}
	if(currentPlace== "what-is-api.html" || currentPlace=="prepare-for-use.html" || currentPlace=="bad-link-name.html" || currentPlace=="link-info-incorrect.html" || currentPlace=="app-bugs.html"){
		fn.load("faq.html");
	}
	if(currentPlace=="app-settings.html" || currentPlace=="dir-settings.html" || currentPlace=="api-settings.html"){
		fn.load("settings.html");
	}
	if(currentPlace=="api-about.html" || currentPlace=="api-short.html" || currentPlace=="api-domains.html" || currentPlace=="api-links.html" || currentPlace=="api-dirs.html" || currentPlace=="api-dir-create.html" || currentPlace=="api-dir-edit.html" || currentPlace=="api-dir-del.html"){
		fn.load("api.html");
	}
}

//Реакция на кнопку "назад" в Serakont App Builder 2
android.webView.setBackButtonLogic("fireEvent");

//при данной реакции отслеживается событие "backButtonPressed"
document.addEventListener("backButtonPressed",goBack);

