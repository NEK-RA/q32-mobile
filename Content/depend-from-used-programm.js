//Поделиться ссылкой
function share(someText) {
  if (someText == "shortLink") {
    shareLink = document.getElementById("shortenedLink").innerHTML;
  } else {
    shareLink = someText;
  }

  var intent = {
    action: "android.intent.action.SEND",
    type: "text/plain",
    extras: {
      "android.intent.extra.TEXT": shareLink,
    },
  };
  android.activity.startActivityForResult(intent, function () {}, true);
}

//скопировать в буфер обмена
function copyToClipboard(someText) {
  if (someText != "shortLink") {
    //метод для копирования в буфер обмена от Serakont App Builder 2
    android.clipboard.setText(someText);
    //метод от него же для отображения "тостов"
    android.toast.show("Скопировано!");
  } else {
    shortLink = document.getElementById("shortenedLink").innerHTML;
    android.clipboard.setText(shortLink);
    android.toast.show("Короткая ссылка скопирована!");
  }
}

// Функция открытия "предыдущей страницы", почти не зависит того в чем идет сборка
function goBack() {
  currentPlace = document.getElementById("content").page;

  if (currentPlace == "short.html") {
    ons.notification
      .confirm({ message: "Закрыть приложение?", buttonLabels: ["Нет", "Да"] })
      .then(function (sure) {
        if (sure == 1) {
          android.activity.finish(); //Закрытие приложения по API Serakont App Builder
        }
      });
  }

  if (
    currentPlace == "settings.html" ||
    currentPlace == "help.html" ||
    currentPlace == "api.html"
  ) {
    fn.load("short.html");
  }
  if (currentPlace == "links.html") {
    folder = localStorage.getItem("watchingFolder");
    page = Number(localStorage.getItem("watchingFolderPage"));
    if (!folder && !page) {
      fn.load("short.html");
    } else {
      if (page == 1) {
        fn.load("links.html");
      } else {
        openDir(folder, page - 1);
      }
    }
  }
  if (
    currentPlace == "novice.html" ||
    currentPlace == "faq.html" ||
    currentPlace == "about.html" ||
    currentPlace == "feedback.html"
  ) {
    fn.load("help.html");
  }
  if (
    currentPlace == "what-is-api.html" ||
    currentPlace == "prepare-for-use.html" ||
    currentPlace == "bad-link-name.html" ||
    currentPlace == "link-info-incorrect.html" ||
    currentPlace == "app-bugs.html"
  ) {
    fn.load("faq.html");
  }
  if (
    currentPlace == "app-settings.html" ||
    currentPlace == "dir-settings.html" ||
    currentPlace == "api-settings.html" ||
    currentPlace == "backups.html"
  ) {
    fn.load("settings.html");
  }
  if (currentPlace == "backups-online.html") {
    fn.load("backups.html");
  }
  if (
    currentPlace == "api-about.html" ||
    currentPlace == "api-short.html" ||
    currentPlace == "api-domains.html" ||
    currentPlace == "api-links.html" ||
    currentPlace == "api-dirs.html" ||
    currentPlace == "api-dir-create.html" ||
    currentPlace == "api-dir-edit.html" ||
    currentPlace == "api-dir-del.html"
  ) {
    fn.load("api.html");
  }
}

//Реакция на кнопку "назад" в Serakont App Builder 2
android.webView.setBackButtonLogic("fireEvent");

//при данной реакции отслеживается событие "backButtonPressed"
document.addEventListener("backButtonPressed", goBack);

//Запись бэкапа в файл
function writeBackup(data) {
  var appDir = new android.File("/sdcard/Q32Mobile");
  var dirExists = appDir.exists();
  console.log("app dir exists: " + dirExists);
  if (!dirExists) {
    appDir.mkdir();
  }
  var bkp = new android.File("/sdcard/Q32Mobile/Backup");
  var fileExists = bkp.exists();
  if (!fileExists) {
    bkp.createNewFile();
  }
  bkp.write(data);
}

//Считывание бэкапа из файла
function readBackup() {
  data = "restoring error";
  var appDir = new android.File("/sdcard/Q32Mobile");
  var dirExists = appDir.exists();
  console.log("app dir exists: " + dirExists);
  if (!dirExists) {
    ons.notification.alert(
      "Папки приложения не существовало, но она была создана. Если у Вас уже есть резервная копия, убедитесь что название файла <b>Backup</b> и поместите его по пути <b>/sdcard/Q32Mobile</b>, после чего повторите попытку."
    );
    appDir.mkdir();
  } else {
    var bkp = new android.File("/sdcard/Q32Mobile/Backup");
    var fileExists = bkp.exists();
    if (!fileExists) {
      ons.notification.alert("Файл резервной копии не найден.");
    } else {
      data = bkp.read();
    }
  }
  return data;
}

//загрузка обновления по переданной ссылке
function download(link) {
  version = "";
  begin = link.indexOf("[");
  end = link.indexOf("]");
  version = link.slice(begin + 1, end);
  filename = "update_" + version + ".apk";
  descript = "Загрузка версии (" + version + ")";

  info = {
    url: link,
    notifications: "visible_notify_completed",
    title: "Q32 Mobile",
    path: filename,
    wifiOnly: "false",
    description: descript,
    visibleInUI: "true",
  };

  dlid = android.download.start(info);

  timerId = setInterval(function () {
    stat = android.download.checkDownloadStatus(dlid);
    good = stat.status == android.download.status.success;
    bad = stat.status == android.download.status.success;
    runing = true;

    if ((good || bad) && runing) {
      runing = false;
      clearInterval(timerId);
    }
    if (!runing) {
      if (good) {
        fp = new android.File(
          android.files.getExternalFilesDir() + "/" + info.path
        );
        upd = new android.File("/sdcard/Q32Mobile/update.apk");
        fp.copyTo(upd);
        fp.delete();
        ons.notification
          .alert(
            "Обновление загружено и сейчас будет установлено. Если Вы отмените установку — APK-файл находится в папке <b>Q32Mobile</b> в памяти устройства."
          )
          .then(function () {
            install(upd);
          });
      } else if (bad) {
        msg = "Загрузка завершилась неудачно по причине:<br>";
        switch (stat.reason) {
          case android.download.reason.waiting_to_retry:
            msg += "Ожидается перезапуск загрузки...";
            break;
          case android.download.reason.waiting_for_network:
            msg += "Отсутствует соединение с сетью";
            break;
          case android.download.reason.waiting_to_retry:
            msg += "Отсутствует соединение с Wi-Fi";
            break;
          case android.download.reason.unknown:
            msg += "Причина неизвестна :(";
            break;
        }
        ons.notification.alert(msg);
      }
    }
  }, 500);
}

//установка APK-файла обновления по указанному пути
function install(apkfile) {
  uri = "file://" + apkfile.toString();
  var intent = {
    action: "android.intent.action.INSTALL_PACKAGE",
    data: uri,
    type: "application/vnd.android.package-archive",
    flags: 1,
  };
  android.activity.startActivityForResult(intent, function () {}, true);
}
