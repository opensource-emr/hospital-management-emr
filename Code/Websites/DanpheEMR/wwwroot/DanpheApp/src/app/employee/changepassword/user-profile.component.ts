
import { Component, ChangeDetectorRef } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { SecurityService } from '../../security/shared/security.service';
import { EmployeeProfile } from './../shared/employee-profile.model';
import { Routes, RouterModule, RouterOutlet } from '@angular/router';
import { MessageboxService } from '../../shared/messagebox/messagebox.service';
import { DanpheRoute } from '../../security/shared/danphe-route.model';
@Component({

  templateUrl: "../../view/employee-view/UserProfile.html" //"/EmployeeView/UserProfile"

})
export class UserProfileComponent {
  public http: HttpClient;
  public userProfileInfo: EmployeeProfile = new EmployeeProfile();
  public pathToImage: string = null;
  public userRoutes: Array<DanpheRoute>;
  private landingRouteId: number = 0;
  public landingModuleRouteId: number = 0;
  public landingChildRouteId: number = 0;
  public childRouteList: Array<DanpheRoute>;

  constructor(
    private securityService: SecurityService,
    private _http: HttpClient,
    private changeDetector: ChangeDetectorRef,
    private msgBoxService: MessageboxService) {
    this.http = _http;
    this.userRoutes = this.securityService.validRouteList.filter(r => r.DefaultShow == true);
    this.LoadUserProfile();
  }
  public options = {
    headers: new HttpHeaders({ 'Content-Type': 'application/x-www-form-urlencoded' })
  };

  //to load the user data
  LoadUserProfile() {
    var empId = this.securityService.GetLoggedInUser().EmployeeId;
    this.http.get<any>("/api/Employee?empId=" + empId + "&reqType=employeeProfile", this.options)
      .map(res => res)
      .subscribe(res => {
        if (res.Status == 'OK') {
          this.OnLoadUserProfileSuccess(res);
          this.changeDetector.detectChanges();
          this.landingRouteId = this.securityService.GetLoggedInUser().LandingPageRouteId;
          this.ResetLandingPageDetails();
        }
        else {
          this.msgBoxService.showMessage('error', ['failed to get the data.. please check log for details.']);
          this.logError(res.ErrorMessage);
        }
      },
        err => {
          this.msgBoxService.showMessage('error', ['failed to get the data.. please check log for details.']);
          this.logError(err);
        });
  }


  OnLoadUserProfileSuccess(res) {
    this.userProfileInfo = res.Results;
    this.pathToImage = "\\" + this.userProfileInfo.ImageFullPath;
  }

  logError(err: any) {
    console.log(err);
  }

  public OnModuleChange() {
    var routelist = this.securityService.validRouteList.find(a => a.RouteId == this.landingModuleRouteId);
    if (routelist) {
      this.childRouteList = routelist.ChildRoutes;
      if (this.childRouteList && this.childRouteList.length > 0) {
        this.childRouteList = this.childRouteList.filter(r => r.DefaultShow == true);
      }
    }
  }
  public SetNewLandingPage() {
    if (this.landingModuleRouteId == 0 || this.landingModuleRouteId == null) {
      this.msgBoxService.showMessage('error', ['please select landing page!!']);
      return;
    }
    if (this.landingChildRouteId == 0 || this.landingChildRouteId == null) {
      this.landingRouteId = this.landingModuleRouteId;
    } else {
      this.landingRouteId = this.landingChildRouteId;
    }
    if (this.landingRouteId == this.securityService.GetLoggedInUser().LandingPageRouteId) {
      this.msgBoxService.showMessage('error', ['This page is already registered as Landing page. Please select a different one.']);
      return;
    }
    var data = {
      UserId: this.securityService.GetLoggedInUser().UserId,
      LandingPageRouteId: this.landingRouteId
    }
    this.SetLandingPage(data);
  }
  public ResetLandingPage() {
    if (this.landingRouteId == 0 || this.landingRouteId == null) {
      return;
    }
    var data = {
      UserId: this.securityService.GetLoggedInUser().UserId,
      LandingPageRouteId: null
    }
    this.SetLandingPage(data);
  }
  private SetLandingPage(data) {
    this.http.post<any>("/api/Employee?reqType=set-landing-page", data, this.options)
      .map(res => res)
      .subscribe(res => {
        if (res.Status == 'OK') {
          this.msgBoxService.showMessage("Success", ['Successfully changed landing page']);
          let loggedUsr = this.securityService.GetLoggedInUser();
          loggedUsr.LandingPageRouteId = res.Results;
          this.landingRouteId = res.Results;
          //removing landing page from session
          sessionStorage.removeItem("isLandingVisited");
          this.ResetLandingPageDetails();
        }
        else {
          this.msgBoxService.showMessage("error", ['Error Please check console.']);
          this.logError(res.ErrorMessage);
        }
      },
        err => {
          this.msgBoxService.showMessage('error', ['failed.. please check log for details.']);
          this.logError(err);
        });
  }
  //reset landing page details on ui
  private ResetLandingPageDetails() {
    var route = this.securityService.UserNavigations.find(a => a.RouteId == this.landingRouteId);
    if (route) {
      if (route.ParentRouteId != null) {
        //path contains ParentRouteId then show parent with child routes
        this.childRouteList = this.securityService.validRouteList.find(a => a.RouteId == route.ParentRouteId).ChildRoutes;
        this.landingModuleRouteId = route.ParentRouteId;
        this.landingChildRouteId = route.RouteId;
      } else {
        //path does not contains ParentRouteId then show only parent 
        this.childRouteList = null;
        this.landingModuleRouteId = route.RouteId;
        this.landingChildRouteId = 0;
      }
    } else {
      //landing page routeid is not found
      this.childRouteList = null;
      this.landingModuleRouteId = 0;
      this.landingChildRouteId = 0;
    }
  }
}
