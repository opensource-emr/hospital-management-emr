import { Injectable, Directive } from '@angular/core';

@Injectable()
export class NavigationService {
//temporary implementation, make it proper later on: sud-7June'18
   public showSideNav:boolean = true;
   public showTopNav:boolean = true;
}