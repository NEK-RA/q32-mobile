//сохранение данных в оффлайн бэкап
function offlineBackup() {
  data = JSON.stringify(localStorage);
  try {
    writeBackup(data);
    ons.notification.alert("Резервная копия успешно создана");
  } catch (error) {
    console.log(error);
    ons.notification.alert("Неудалось создать резервную копию");
  }
}

//Восстановление данных из оффлайн бэкапа
function offlineRestore() {
  data = readBackup();
  if (data == "restoring error") {
    ons.notification.alert("Ошибка восстановления резервной копии");
  } else {
    tempObj = JSON.parse(data, function (key, value) {
      if (key != null && key != "") {
        localStorage.setItem(key, value);
      }
    });
    applyBackup();
  }
}

//применение данных бэкапа
function applyBackup() {
  if (localStorage.getItem("appTheme") == "dark") {
    $("#app-theme").attr("href", "onsen/dark-onsen-css-components.min.css");
  }
  if (localStorage.getItem("appTheme") == "light") {
    $("#app-theme").attr("href", "onsen/onsen-css-components.min.css");
  }
  if (localStorage.getItem("APIinMenu") == "yes") {
    $("#APImenuItem").css("display", "block");
  }
  if (localStorage.getItem("APIinMenu") == "no") {
    $("#APImenuItem").css("display", "none");
  }
  ons.notification.alert("Бэкап восстановлен");
}
