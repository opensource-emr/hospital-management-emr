import { Injectable, Directive } from '@angular/core';
import { HttpClient,HttpHeaders } from '@angular/common/http';

@Injectable()
export class SecurityDLService {
public options =  {
        headers: new HttpHeaders({ 'Content-Type': 'application/x-www-form-urlencoded' })};
 
    constructor(public http: HttpClient) {
    }


    //adding the samplecode 
    public GetLoggedInUserInfo() {
        return this.http.get<any>("/api/Security?reqType=loggedInUser", this.options);
    }
    //Get Valid Navigation Route List
    public GetValidNavigationRouteList() {
        return this.http.get<any>("/api/Security?reqType=routeList", this.options);

    }

    //Get valid user permission list
    public GetValidUserPermissionList() {
        return this.http.get<any>("/api/Security?reqType=userPermissionList",this.options);
    }

    public GetActiveBillingCounter() {
        return this.http.get<any>("/api/Security?reqType=activeBillingCounter", this.options);
    }
    public GetActivePharmacyCounter() {
        return this.http.get<any>("/api/Security?reqType=activePharmacyCounter", this.options);
    }
    public GetAllValidRouteList() {
        return this.http.get<any>("/api/Security?reqType=validallrouteList", this.options);
    }

}