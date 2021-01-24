# MyLib

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 10.2.0.

## Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.

## Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory. Use the `--prod` flag for a production build.

## Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Running end-to-end tests

Run `ng e2e` to execute the end-to-end tests via [Protractor](http://www.protractortest.org/).

## Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI Overview and Command Reference](https://angular.io/cli) page.

Нужно в node_modules добавить либу epgu-lib

Если что-ниб изменили в либе с чатом (в папке projects):
меняем версию в package.json именно в projects/package.json 1.0.20 -> 1.0.21
далее делаем билд: ng build epgu-chat --watch
переходим в билд: cd dist/epgu-chat/
проверим верна ли новая версия библиотеки кот хотим опубликовать в качестве npm-модуля на npmjs: npm version
если уже есть профиль на сайте npmjs тогда переходим в командую строку и авторизируемся с помощью команды: npm login
и выполняем команду для публикации: npm publish

epgu-chat-lib
@angular/material
@angular/cdk
@ckeditor/ckeditor5-build-classic
ngx-perfect-scrollbar
angular2-text-mask
@ngx-translate/core
@ngx-translate/http-loader
moment
@ckeditor/ckeditor5-angular
ngx-linkifyjs
hammerjs

1)BrowserAnimationsModule

2)файл proxy.conf.json

3)в angular.json "proxyConfig": "proxy.conf.json"

4)api.interceptor.ts и в app.module.ts в providers:
    {
        provide: HTTP_INTERCEPTORS,
        useClass: ApiInterceptor,
        multi: true
    } (multi = true для того чтобы если у нас будет несколько интерсепторов чтобы они не перетирались а добавлялись поочередно)

6)в tsconfig.json или tsconfig.app.json в paths:
    "@ifc/plugin": ["node_modules/epgu-lib/assets/vendor/ifcplugin-lib.js"],
    "@ifc/common": ["node_modules/epgu-lib/assets/vendor/ifccommon-lib.js"]

7)в angular.json projects.gudom.architect.build.assets:
    {
        "glob": "**/*",
        "input": "./node_modules/epgu-lib/assets",
        "output": "./lib-assets"
    }
8)в index.html <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">

9)в angular.json projects.gudom.architect.build.styles:
    "./node_modules/@angular/material/prebuilt-themes/indigo-pink.css"
