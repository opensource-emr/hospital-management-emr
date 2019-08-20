import { Injectable, Directive } from '@angular/core';
import { User } from "./user.model";
import { BillingCounter } from "../../billing/shared/billing-counter.model";
import { DanpheRoute } from "../../security/shared/danphe-route.model"
import { PharmacyCounter } from "../../pharmacy/shared/pharmacy-counter.model"
import { Permission } from "../../security/shared/permission.model"
import { CoreService } from "../../core/shared/core.service";


@Injectable()
export class SecurityService {

  constructor(private coreService: CoreService) {
  }

  public loggedInUser: User = new User();
  public GetLoggedInUser(): User {
    return this.loggedInUser;
  }

  public LoggedInCounter: BillingCounter = new BillingCounter();
  public getLoggedInCounter(): BillingCounter {
    return this.LoggedInCounter;
  }

  public PHRMLoggedInCounter: PharmacyCounter = new PharmacyCounter();
  public getPHRMLoggedInCounter(): PharmacyCounter {
    return this.PHRMLoggedInCounter;
  }

  public setPhrmLoggedInCounter(currCounter: PharmacyCounter) {
    this.PHRMLoggedInCounter = currCounter;
  }
  //Get Child Navigation Routes
  public UserNavigations: Array<DanpheRoute> = new Array<DanpheRoute>();
  public GetChildRoutes(UrlFullPath): Array<DanpheRoute> {
    let showHideRoute = false;
    let currRoute = this.UserNavigations.find(a => a.UrlFullPath == UrlFullPath);
    //check valid route for logged in user if there is not valid currRoute then return undefined
    if (currRoute) {
      return this.UserNavigations.filter(a => currRoute.RouteId == a.ParentRouteId && a.DefaultShow != showHideRoute);
    }
    else {
      return undefined;
    }

  }
  public validRouteList: Array<DanpheRoute> = new Array<DanpheRoute>();
  public GetAllValidRoutes(): Array<DanpheRoute> {
    this.validRouteList.forEach(r => {
      let re = /\ /gi;
      let result = r.DisplayName.replace(re, "");
      r.DisplayName = result;

    });
    return this.validRouteList;
  }
  public UserPermissions: Array<Permission> = new Array<Permission>();
  //check permission is valid for user
  //Ajay 09-10-2018
  public HasPermission(PermissionName) {
    // let userPermissions = this.UserPermissions.filter(a => a.PermissionName == PermissionName);
    let currPermission = this.UserPermissions.find(a => a.PermissionName == PermissionName);
    if (currPermission != undefined) {
      return true;
    }
    return false;
  }
  public checkIsAuthorizedURL(urlFullPath) {
    // urlFullPath like '/Billing/Transaction'
    // using substring() we are getting filtered url like 'Billing/Transaction' because in database we are saving like this.
    let urlFiltered = urlFullPath.substring(1);
    //Ajay 01Apr'19
    //exluding Common URL list for all user for now its for user profile
    let coreParameter = this.coreService.Parameters.filter(p => p.ParameterGroupName == "Security" && p.ParameterName == "CommonURLFullPath");
    if (coreParameter.length > 0) {
      let excludeURLFullPathFromAuthorization = JSON.parse(coreParameter[0].ParameterValue).URLFullPathList.find(a => a.URLFullPath == urlFiltered);
      if (excludeURLFullPathFromAuthorization) {
        return true;
      }
    }

    let nav = this.UserNavigations.find(n => n.UrlFullPath == urlFiltered);
    if (nav) {
      return true;
    } else {
      return false;
    }
  }
}
