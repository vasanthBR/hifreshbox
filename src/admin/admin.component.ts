import { Component } from '@angular/core';
import { Router, Event as RouterEvent, NavigationStart, 
  NavigationEnd, NavigationCancel, NavigationError } from "@angular/router";

@Component({
  // tslint:disable-next-line
  selector: 'body',
  template: `
    <div class="body_bg"></div>
    <div class="overlay_loading app flex-row align-items-center" [ngClass]="{'hidden-xl-down' : !loading}">
      <div class="sk-three-bounce">
        <div class="sk-child sk-bounce1"></div>
        <div class="sk-child sk-bounce2"></div>
        <div class="sk-child sk-bounce3"></div>
      </div>
    </div>
    <router-outlet></router-outlet>
  `
})
export class AdminComponent {
  // Sets initial value to true to show loading spinner on first load
  loading = true

  constructor(private router: Router) {
    router.events.subscribe((event: RouterEvent) => {
      this.navigationInterceptor(event)
    })
  }

  // Shows and hides the loading spinner during RouterEvent changes
  navigationInterceptor(event: RouterEvent): void {
    if (event instanceof NavigationStart) { 
      this.loading = true
    }
    if (event instanceof NavigationEnd) {
      this.loading = false
    }

    // Set loading state to false in both of the below events to hide the spinner in case a request fails
    if (event instanceof NavigationCancel) {
      this.loading = false
    }
    if (event instanceof NavigationError) {
      this.loading = false
    }
  }
}
