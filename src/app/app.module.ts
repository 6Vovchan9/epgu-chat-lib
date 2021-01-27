import { NgModule } from '@angular/core';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { ListModule } from 'dist/epgu-chat'; // Тут надо будет поменять ссылку на пакет 'epgu-chat'
import { BorderModule } from 'dist/epgu-chat';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { ApiInterceptor } from './interceptors/api.interceptor';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
// import { NewCompComponent } from './pages/new-comp/new-comp.component';
// import { ChatsPageModule } from 'dist/epgu-chat';

@NgModule({
  declarations: [
    AppComponent,
    // NewCompComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    ListModule,
    BorderModule,
    // ChatsPageModule
  ],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: ApiInterceptor,
      multi: true
    } // multi = true для того чтобы если у нас будет несколько интерсепторов чтобы они не перетирались а добавлялись поочередно
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
