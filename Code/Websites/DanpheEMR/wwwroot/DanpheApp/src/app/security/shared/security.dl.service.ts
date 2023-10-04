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
        return this.http.get<any>("/api/Security/LoggedInUserInformation", this.options);
    }
    //Get Valid Navigation Route List
    public GetValidNavigationRouteList() {
        return this.http.get<any>("/api/Security/NavigationRoutes", this.options);

    }

    //Get valid user permission list
    public GetValidUserPermissionList() {
        return this.http.get<any>("/api/Security/UserPermissions", this.options);
    }

    public GetActiveBillingCounter() {
        return this.http.get<any>("/api/Security/ActiveBillingCounter", this.options);
    }
    public GetActiveLab(){
        return this.http.get<any>("/api/Security/ActiveLab", this.options);
    }
    public GetActivePharmacyCounter() {
        return this.http.get<any>("/api/Security/ActivePharmacyCounter", this.options);
    }
    public GetAllValidRouteList() {
        return this.http.get<any>("/api/Security/ValidRoutes", this.options);
    }



    //sud-nagesh: 21Jun'20
    public GetAccHospitalInfo() {
        return this.http.get<any>("/api/Security/ActiveAccountingHospitalInformation", this.options);
    }
    //NageshBB: 10 sep 2020
    public GetINVHospitalInfo(){
        return this.http.get<any>("/api/Security/InventeryHospitalInformation", this.options);
    }

    public ActivateLab(labId: number, labName: string){
        return this.http.put<any>("/api/Security/ActivateLab?labId=" +labId +"&labName=" +labName, this.options);
      }

}
