import { Component } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { SecurityService } from '../security/shared/security.service';
import { EmployeeProfile } from './shared/employee-profile.model';
import { Routes, RouterModule, RouterOutlet } from '@angular/router';
import { EmployeeProfileComponent } from './employee-profile.component';
import { EmployeeService } from "./shared/employee.service";
@Component({
    templateUrl: "../../app/view/employee-view/ProfileMain.html" // "/EmployeeView/ProfileMain"
})
export class EmployeeProfileMainComponent {

    public http: HttpClient;
    public userProfileInfo: EmployeeProfile = new EmployeeProfile();
    /// public pathToImage: string = null;

    constructor(public securityService: SecurityService, _http: HttpClient,
        public employeeService: EmployeeService) {
        this.http = _http;
        this.LoadUserProfile();

    }
    public options =  {
        headers: new HttpHeaders({ 'Content-Type': 'application/x-www-form-urlencoded' })};
 
    //to load the user data
    LoadUserProfile() {

        var empId = this.securityService.GetLoggedInUser().EmployeeId;
        this.http.get<any>("/api/Employee?empId=" + empId + "&reqType=employeeProfile", this.options)
            .map(res => res)
            .subscribe(res => {
                if (res.Status == 'OK') {
                    this.OnLoadUserProfileSuccess(res);
                }
                else {
                    alert(res.ErrorMessage);
                    this.logError(res.ErrorMessage);
                }
            },
            err => {
                alert('failed to get the data.. please check log for details.');
                this.logError(err.ErrorMessage);
            });
    }


    OnLoadUserProfileSuccess(res) {
        this.userProfileInfo = res.Results;
        this.employeeService.ProfilePicSrcPath = "\\" + this.userProfileInfo.ImageFullPath;

    }


    logError(err: any) {
        console.log(err);
    }

}