import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { LocationStrategy, HashLocationStrategy } from '@angular/common';

import { AdminComponent } from './admin.component';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { TabsModule } from 'ngx-bootstrap/tabs';
import { NAV_DROPDOWN_DIRECTIVES } from 'app/shared/nav-dropdown.directive';

import { ChartsModule } from 'ng2-charts/ng2-charts';
import { SIDEBAR_TOGGLE_DIRECTIVES } from 'app/shared/sidebar.directive';
import { AsideToggleDirective } from 'app/shared/aside.directive';
import { BreadcrumbsComponent } from 'app/shared/breadcrumb.component';

// Routing Module
import { AdminRoutingModule } from './admin.routing';

//Layouts
import { FullLayoutComponent } from './layouts/full-layout.component';
import { SimpleLayoutComponent } from './layouts/simple-layout.component';

import { HttpModule } from "@angular/http";
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { AuthService, AlertService } from "services";
import { AlertComponent } from "components";

import {TooltipModule} from "ngx-tooltip";
import { mgCatalogAttribute } from "pipes";

@NgModule({
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    AdminRoutingModule,
    BsDropdownModule.forRoot(),
    TabsModule.forRoot(),
    ChartsModule,
    HttpModule,
    ReactiveFormsModule,
    TooltipModule
  ],
  declarations: [
    AdminComponent,
    FullLayoutComponent,
    SimpleLayoutComponent,
    NAV_DROPDOWN_DIRECTIVES,
    BreadcrumbsComponent,
    SIDEBAR_TOGGLE_DIRECTIVES,
    AsideToggleDirective,
    AlertComponent,
    mgCatalogAttribute
  ],
  providers: [
    {
      provide: LocationStrategy,
      useClass: HashLocationStrategy
    },
    AuthService, AlertService
  ],
  bootstrap: [ AdminComponent ]
})
export class AdminModule { }
