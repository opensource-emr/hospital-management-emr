import { Injectable, Directive } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Injectable()
export class SecurityDLService {
    public options = {
        headers: new HttpHeaders({ 'Content-Type': 'application/x-www-form-urlencoded' })
    };

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
        return this.http.get<any>("/api/Security?reqType=userPermissionList", this.options);
    }

    public GetActiveBillingCounter() {
        return this.http.get<any>("/api/Security?reqType=activeBillingCounter", this.options);
    }
    public GetActiveLab(){
        return this.http.get<any>("/api/Security?reqType=activeLab", this.options);
    }
    public GetActivePharmacyCounter() {
        return this.http.get<any>("/api/Security?reqType=activePharmacyCounter", this.options);
    }
    public GetAllValidRouteList() {
        return this.http.get<any>("/api/Security?reqType=validallrouteList", this.options);
    }



    //sud-nagesh: 21Jun'20
    public GetAccHospitalInfo() {
        return this.http.get<any>("/api/Security?reqType=get-activeAccHospitalInfo", this.options);
    }
    //NageshBB: 10 sep 2020
    public GetINVHospitalInfo(){
        return this.http.get<any>("/api/Security?reqType=get-inv-hospitalInfo", this.options);
    }

    public ActivateLab(labId: number, labName: string){
        return this.http.put<any>("/api/Security?reqType=activateLab&labId=" +labId +"&labName=" +labName, this.options);
      }

}
