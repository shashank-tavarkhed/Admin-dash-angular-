import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import {MatCardModule} from '@angular/material/card';
import { RouterModule } from '@angular/router';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import {MatIconModule} from '@angular/material/icon';


import { AppComponent } from './app.component';
import { NavComponent } from './nav/nav.component';
import { DetailsComponent } from './details/details.component';
import { PageaComponent } from './pagea/pagea.component';
import { OneComponent } from './one/one.component';
import { TwoComponent } from './two/two.component';
import { AppRoutingModule } from './app-routing.module';

@NgModule({
  declarations: [
    AppComponent,
    NavComponent,
    DetailsComponent,
    PageaComponent,
    OneComponent,
    TwoComponent
  ],
  imports: [
    BrowserModule,
    MatCardModule,
    RouterModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    MatIconModule,
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
