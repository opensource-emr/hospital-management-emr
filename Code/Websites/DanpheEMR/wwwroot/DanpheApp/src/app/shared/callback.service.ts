import { Injectable, Directive } from '@angular/core';

@Injectable()
export class CallbackService {

    public _callbackRoute: string = "";

    // <----------Relationship--------->
    get CallbackRoute(): string {
        return this._callbackRoute;
    }
    set CallbackRoute(route: string) {
        this._callbackRoute = route;
    }



}