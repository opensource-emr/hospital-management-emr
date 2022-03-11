import { Injectable, Directive } from "@angular/core";
import { User } from "./user.model";
import { BillingCounter } from "../../billing/shared/billing-counter.model";
import { DanpheRoute } from "../../security/shared/danphe-route.model";
import { PharmacyCounter } from "../../pharmacy/shared/pharmacy-counter.model";
import { Permission } from "../../security/shared/permission.model";
import { CoreService } from "../../core/shared/core.service";
import { PHRMStoreModel } from "../../pharmacy/shared/phrm-store.model";
import { Router } from "@angular/router";
import { Ward } from "../../adt/shared/ward.model";
import { AccHospitalInfoVM } from "../../accounting/shared/acc-view-models";
import * as moment from 'moment/moment';
import { NepaliCalendarService } from "../../shared/calendar/np/nepali-calendar.service";
import { MonthModel } from "../../accounting/settings/shared/fiscalyear.model";
import { NepaliMonth } from "../../shared/calendar/np/nepali-dates";
import { LabTypesModel } from "../../labs/lab-selection/lab-type-selection.component";
@Injectable()
export class SecurityService {
  constructor(private coreService: CoreService, public _router: Router,private nepaliCalendarService:NepaliCalendarService) { }
  public currentModule: any = null;
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
  public ActiveStore: PHRMStoreModel = new PHRMStoreModel();
  public getActiveStore(): PHRMStoreModel {
    return this.ActiveStore;
  }
  public setActiveStore(currStore: PHRMStoreModel) {
    this.ActiveStore = currStore;
  }
  //sanjit: 14 May'20, to implement authorization in Nursing Inpatient Modue.
  private _activeWard: any;
  public getActiveWard(): Ward {
    return this._activeWard;
  }
  public setActiveWard(currWard: Ward) {
    this._activeWard = currWard;
  }

  //Anjana: 8 Feb,2021: to implement authorization in Lab for LPH changes
  private _activeLab: LabTypesModel;
  public getActiveLab():LabTypesModel {
    return this._activeLab;
  }

  public setActiveLab(currLab: LabTypesModel){
    this._activeLab = currLab;
  }


  public AccHospitalInfo: AccHospitalInfoVM = new AccHospitalInfoVM();
  public INVHospitalInfo: AccHospitalInfoVM= new AccHospitalInfoVM(); //NageshBB- 10 Sep 2020: we are using AccHospitalInforVM for inventory also
  public ModuleNameForFiscalYear: string ="accounting"; //default is accounting
  public SetAccHospitalInfo(hospitalInfo) {
     //this function will assign proper data to list as per month details
     this.AccHospitalInfo = this.FiscalYearListAssignData(hospitalInfo); 
  }
  public GetAccHospitalInfo(): AccHospitalInfoVM {    
    return this.AccHospitalInfo;
  }

  public SetINVHospitalInfo(hospitalInfo) {
     //this function will assign proper data to list as per month details
     this.INVHospitalInfo = this.FiscalYearListAssignData(hospitalInfo); 
  }
  
  public GetINVHospitalInfo(): AccHospitalInfoVM {    
    return this.INVHospitalInfo;
  }
 //this function will assign proper data to list as per month details
 public FiscalYearListAssignData(hospitalMasterData:AccHospitalInfoVM){
   if(this.ModuleNameForFiscalYear.length >0 && hospitalMasterData && hospitalMasterData.FiscalYearList.length >0){
    hospitalMasterData.FiscalYearList.map(f => {

      f.StartDate = moment(f.StartDate).format("YYYY-MM-DD");
      f.EndDate = moment(f.EndDate).format("YYYY-MM-DD");

      f.NepaliFiscalYearName=f.FiscalYearName;
      f.EnglishFiscalYearName= moment(f.StartDate).format("YYYY")+'/'+moment(f.EndDate).format("YYYY");
      f.nStartDate=this.nepaliCalendarService.ConvertEngToNepDateString(f.StartDate);
      f.nEndDate=this.nepaliCalendarService.ConvertEngToNepDateString(f.EndDate);

      let IsCurrentFY=(f.FiscalYearId==hospitalMasterData.CurrFiscalYear.FiscalYearId)?true:false;
      let startDate = moment(f.StartDate, "YYYY-M-DD");
      let endDate = moment(f.EndDate, "YYYY-M-DD").endOf("month");
      f.EnglishMonthList= new Array<MonthModel>();
      while (startDate.isBefore(endDate)) {
          let monthModel= new MonthModel();
          monthModel.MonthName=startDate.format("YYYY-MMM");
          monthModel.FirstDay =(moment(moment(f.StartDate,"YYYY-M-DD"),"YYYY-MMM")==moment(startDate,"YYYY-MMM"))?moment(f.StartDate).format("YYYY-MM-DD"): moment(startDate).startOf('month').format('YYYY-MM-DD');
          monthModel.LastDay=(moment(moment(f.EndDate,"YYYY-M-DD"),"YYYY-MMM")==moment(startDate,"YYYY-MMM")) ?moment(f.EndDate).format("YYYY-MM-DD"): moment(startDate).endOf('month').format("YYYY-MM-DD"); 
          monthModel.MonthNumber=parseInt( startDate.format("MM"));
          if(IsCurrentFY){
            let afterMonth=moment(startDate.format("YYYY-MM-DD")).isAfter( moment(hospitalMasterData.TodaysDate).format("YYYY-MM-DD"),'month');
            monthModel.IsDisabled=(afterMonth==true)?true:false;
            if(startDate.format("YYYY-MMM")==moment(hospitalMasterData.TodaysDate).format("YYYY-MMM")){
              monthModel.LastDay=moment(hospitalMasterData.TodaysDate).format("YYYY-MM-DD");
            }
          }
          f.EnglishMonthList.push(monthModel);
          startDate = startDate.add(1, "month");
      };
      let nepaliMonthList= NepaliMonth.GetNepaliMonths();
      let nepSD=this.nepaliCalendarService.ConvertEngToNepDate(f.StartDate);
      let nepED=this.nepaliCalendarService.ConvertEngToNepDate(f.EndDate);
      let nepToday=this.nepaliCalendarService.ConvertEngToNepDate(hospitalMasterData.TodaysDate);
      let fsYear=nepSD.Year;
      let fsMonth=nepSD.Month;
      f.NepaliMonthList=new Array<MonthModel>();
      while(fsYear <=nepED.Year){
        let npMonthModel=new MonthModel();
        if((fsMonth<=nepaliMonthList.length && fsYear==nepSD.Year) ||(fsMonth <=nepED.Month && fsYear==nepED.Year) ){
          npMonthModel.MonthName=fsYear.toString()+"-"+nepaliMonthList.find(m=>m.monthNumber==fsMonth).monthName;
          let d=this.nepaliCalendarService.GetStartEndDatesOfNepaliMonth_InEngFormat(fsYear,fsMonth);  
          let s=this.nepaliCalendarService.ConvertEngToNepDate(d.StartDate);
          let e= this.nepaliCalendarService.ConvertEngToNepDate(d.EndDate);
          npMonthModel.FirstDay= d.StartDate;
          npMonthModel.LastDay=d.EndDate;
          npMonthModel.MonthNumber=fsMonth;
          f.NepaliMonthList.push(npMonthModel);
          if(IsCurrentFY){          
            let afterMonth=moment(moment(npMonthModel.FirstDay).format("YYYY-MM-DD")).isAfter(moment( hospitalMasterData.TodaysDate).format("YYYY-MM-DD") );
            npMonthModel.IsDisabled=(afterMonth==true)?true:false;  
            if(npMonthModel.MonthName==nepToday.Year.toString()+"-"+nepaliMonthList.find(m=>m.monthNumber==nepToday.Month).monthName){
              npMonthModel.LastDay=moment(hospitalMasterData.TodaysDate).format("YYYY-MM-DD");
            }          
          }
        }              
        if(fsMonth<=nepaliMonthList.length && fsYear==nepSD.Year){
          fsMonth=fsMonth+1;
        }else if(fsMonth<=nepED.Month && fsYear==nepED.Year){
          fsMonth=fsMonth+1;
        }else if(fsMonth >nepaliMonthList.length && fsYear==nepSD.Year){
          fsMonth=1;
          fsYear=nepED.Year;
        }else if((fsMonth > nepaliMonthList.length || fsMonth > nepED.Month) && fsYear==nepED.Year){
          fsYear=nepED.Year+1;
        }
      }     
    });  
    return hospitalMasterData;
  }
   else{
     return new AccHospitalInfoVM();
   }
  
 }


  public SetModuleName(moduleName) {
    this.ModuleNameForFiscalYear = moduleName;
  }
  public GetModuleName(): string {    
    return this.ModuleNameForFiscalYear;
  }


  // //Anish: Set the selected hospital in Accounting, 5 June 2020
  // private _activatedHospital: any;
  // public getActiveHospitalInAccounting(): any {
  //   return this._activatedHospital;
  // }
  // public setActiveHospitalInAccounting(activatedHospital: any) {
  //   this._activatedHospital = activatedHospital;
  // }

  //Get Child Navigation Routes
  public UserNavigations: Array<DanpheRoute> = new Array<DanpheRoute>();
  public GetChildRoutes(UrlFullPath): Array<DanpheRoute> {
    let showHideRoute = false;
    let currRoute = this.UserNavigations.find(
      (a) => a.UrlFullPath == UrlFullPath
    );
    //check valid route for logged in user if there is not valid currRoute then return undefined
    if (currRoute) {
      return this.UserNavigations.filter(
        (a) =>
          currRoute.RouteId == a.ParentRouteId && a.DefaultShow != showHideRoute
      );
    } else {
      return undefined;
    }
  }
  public validRouteList: Array<DanpheRoute> = new Array<DanpheRoute>();
  public GetAllValidRoutes(): Array<DanpheRoute> {
    this.validRouteList.forEach((r) => {
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

    let currPermission = this.UserPermissions.find(p => p.PermissionName == PermissionName && p.IsActive == true);

    if (currPermission != undefined) {
      return true;
    }
    return false;
  }

  public checkIsAuthorizedURL(urlFullPath) {
    // urlFullPath like '/Billing/Transaction'
    // using substring() we are getting filtered url like 'Billing/Transaction' because in database we are saving like this.
    let urlFiltered: string = urlFullPath.substring(1);
    //Ajay 01Apr'19
    //exluding Common URL list for all user for now its for user profile
    let coreParameter = this.coreService.Parameters.filter(
      (p) =>
        p.ParameterGroupName == "Security" &&
        p.ParameterName == "CommonURLFullPath"
    );
    if (coreParameter.length > 0) {
      let excludeURLFullPathFromAuthorization = JSON.parse(
        coreParameter[0].ParameterValue
      ).URLFullPathList.find((a) => a.URLFullPath == urlFiltered);
      if (excludeURLFullPathFromAuthorization) {
        return true;
      }
    }

    let pathSplitted = urlFiltered.split("/");
    let currParent = pathSplitted[0];
    if (pathSplitted.length > 1) {
      let len = pathSplitted.length;
      let lenToRemove = pathSplitted[len - 1].length;
      currParent = urlFiltered.substring(
        0,
        urlFiltered.length - lenToRemove - 1
      );
    }

    let navSibLings = this.UserNavigations.filter((u) => {
      if (
        u.UrlFullPath.indexOf(currParent) == 0 &&
        u.UrlFullPath !== currParent
      ) {
        return true;
      } else {
        return false;
      }
    });
    navSibLings.sort(function (a, b) {
      return a.DisplaySeq - b.DisplaySeq;
    });
    //console.log(navSibLings);

    let nav = this.UserNavigations.find((n) => n.UrlFullPath == urlFiltered);

    if (nav) {
      nav.IsSecondaryNavInDropdown
        ? (this.coreService.currSelectedSecRoute = nav)
        : (this.coreService.currSelectedSecRoute = null);
      return true;
    } else {
      if (navSibLings && navSibLings.length) {
        navSibLings[0].IsSecondaryNavInDropdown
          ? (this.coreService.currSelectedSecRoute = navSibLings[0])
          : (this.coreService.currSelectedSecRoute = null);
        this._router.navigate([navSibLings[0].UrlFullPath]);
        return true;
      }
      return false;
    }
  }

}
