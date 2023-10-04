import { Injectable, Directive } from '@angular/core';

@Injectable()
export class RouteFromService {

    public _routefrom: string = "";

    // <----------Relationship--------->
    get RouteFrom(): string {
        return this._routefrom;
    }
    set RouteFrom(route: string) {
        this._routefrom = route;
    }

    public routeData : any = null; //routeData format for Settlement: {Action: 'ShowSettlememt',PatientId: 2345};
}