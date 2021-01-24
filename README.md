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
