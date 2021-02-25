import { Component, ChangeDetectorRef } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { VisitService } from "./appointments/shared/visit.service";
import { PatientService } from "./patients/shared/patient.service";
import { SecurityService } from './security/shared/security.service'
import { SecurityBLService } from './security/shared/security.bl.service';
import { User } from "./security/shared/user.model";
import { CoreService } from './core/shared/core.service';
import { DanpheRoute } from "./security/shared/danphe-route.model";
import { DLService } from "./shared/dl.service";
import { MessageboxService } from './shared/messagebox/messagebox.service';
import {
  Router,
  Event as RouterEvent,
  NavigationStart,
  NavigationEnd,
  NavigationCancel,
  NavigationError
} from '@angular/router'

import 'rxjs/add/operator/map' //needed to subscribe from rxjs.
import { NavigationService } from './shared/navigation-service';
import { DanpheHTTPResponse } from './shared/common-models';
import { DanpheCache, MasterType } from './shared/danphe-cache-service-utility/cache-services';
import { EmployeeService } from './employee/shared/employee.service';
// import { parse } from 'path';


@Component({
  selector: 'my-app',
  templateUrl: "./view/home-view/AppMain.html"
})

// App Component class--this is MainComponent from earlier..
export class AppComponent {
  public http: HttpClient;
  public PatService: PatientService;
  public currentUsr: User = new User();

  public pageParameters = { CustomerName: "", LandingPageCustLogo: "", EmpiLabel: "" };
  public currUser: User = new User();
  public nepDate: any;
  public validRoutes: Array<DanpheRoute> = new Array<DanpheRoute>();
  public showDatePopup: boolean = false;
  public empPre = { np: false, en: false };
  public selectedDatePref: string = "";
  public defaultCal = "";
  constructor(public _http: HttpClient, _serv: PatientService,
    public router: Router,
    public VisService: VisitService,
    public coreService: CoreService,
    public securityService: SecurityService,
    public securityBlService: SecurityBLService, public employeeService: EmployeeService,
    public dlService: DLService, public navService: NavigationService,
    public changeDetector: ChangeDetectorRef,
    public msgBoxServ: MessageboxService) {
    this.PatService = _serv;

    //START:data loads from api into cache memory.
    DanpheCache.GetData(MasterType.Country, null);
    DanpheCache.GetData(MasterType.SubDivision, null);
    DanpheCache.GetData(MasterType.BillingCounter, null);
    DanpheCache.GetData(MasterType.PhrmCounter, null);
    DanpheCache.GetData(MasterType.Employee, null);
    //END:data loads from api into cache memory.

    this.GetAllValidRouteList();
    this.http = _http;
    //we're initializing parameters in the First component that will be loaded into the application.
    //i.e: bootstrap component. 
    this.coreService.InitializeParameters().subscribe(res => {
      this.CallBackLoadParameters(res);
    });

    //load all master entries at the beginning only.
    this.coreService.GetMasterEntities().subscribe(res => {
      this.coreService.SetMasterEntities(res);
    });
   
    //load all the application lookups.
    this.coreService.GetAllLookups().subscribe(res => {
      this.coreService.SetAllLookUps(res);
    });
  

    //Get Valid Navigation Routes list
    this.SetValidNavigationRoute();

    //get valid user permission list
    this.SetValidUserPermissions();

    //load appsettings --sud:25Dec'18
    this.coreService.InitializeAppSettings().subscribe((res: DanpheHTTPResponse) => {
      if (res.Status == "OK") {
        this.coreService.AppSettings = res.Results;
        this.coreService.SetAppVersionNum();
      }
    });

    //set counterInformation at the time of loading
    this.GetActiveCounter();

    //set counterInformation of pharmacy at the time of loading
    this.GetActivePharmacyCounter();

    //sud-nagesh:21Jun'20-- to get and set current hospital information for accounting.
    this.LoadAccountingHospitalInfo();

    //to show-hide loading image when route changes from one to another.
    //we've to subscribe to the router event to do that. 
    router.events.subscribe((event: RouterEvent) => {
      this.navigationInterceptor(event);
    });



    //add windows listener for logout-event.. this will be triggered from Logout button on top.
    //If logout-event is fired from any other tab (of the curent session), it'll logout from this tab as well.
    window.addEventListener('storage', (event) => {
      if (event.key == 'logout-event') {
        window.location.href = '/Account/Logout';
      }
    });

    // get default caleder perference at user level
    this.coreService.getCalenderDatePreference().subscribe(res => {
      this.coreService.SetCalenderDatePreference(res);
      if (this.coreService.DatePreference != "") {
        if (this.coreService.DatePreference == 'np') {
          this.DatePreferenceData('np');
        }
        else {
          this.DatePreferenceData('en');
        }
      }
    });
  }


  // Sets initial value to true to show loading spinner on first load
  loading: boolean = true;
  public loadingScreen: boolean = false; //default not showing loading screen 
  ngAfterViewChecked() {
    this.changeDetector.detectChanges();
  }
  //this function takes parameter value from database for shwo or hide every http request loading screen   
  setLoadingScreenVal() {
    try {
      var parVal = this.coreService.Parameters.filter(p => p.ParameterName == "showLoadingScreen" && p.ParameterGroupName.toLowerCase() == "common");
      if (parVal) {
        this.loadingScreen = parVal[0].ParameterValue.toLowerCase() == 'true' ? true : false;
      }
    } catch (exception) {
      let ex: Error = exception;
      console.log("Error Messsage =>  " + ex.message);
      console.log("Stack Details =>   " + ex.stack);
    }
  }
  // Shows and hides the loading spinner during RouterEvent changes
  navigationInterceptor(event: RouterEvent): void {
    if (event instanceof NavigationStart) {
      this.loading = true;
    }
    if (event instanceof NavigationEnd) {
      this.loading = false;
    }

    // Set loading state to false in both of the below events to hide the spinner in case a request fails
    if (event instanceof NavigationCancel) {
      this.loading = false;
    }
    if (event instanceof NavigationError) {
      this.loading = false;
    }
  }
  GetLoggedInUserId(): void {
    this.securityBlService.GetLoggedInUserInformation()
      .subscribe(res => {
        if (res.Status == 'OK') {
          let loggedUsr = this.securityService.GetLoggedInUser();

          loggedUsr.UserId = res.Results.UserId;
          loggedUsr.UserName = res.Results.UserName;
          loggedUsr.EmployeeId = res.Results.EmployeeId;
          loggedUsr.Employee = res.Results.Employee;
          loggedUsr.Profile = res.Results.Profile;
          loggedUsr.NeedsPasswordUpdate = res.Results.NeedsPasswordUpdate;
          loggedUsr.LandingPageRouteId = res.Results.LandingPageRouteId;
          loggedUsr.IsSystemAdmin = res.Results.IsSysAdmin;
          this.currentUsr = loggedUsr;
          if (loggedUsr.Profile.ImageLocation == "") {
            this.employeeService.ProfilePicSrcPath = "/themes/theme-default/images/NO_Image.png";
          } else {
            this.employeeService.ProfilePicSrcPath = "\\" + this.currentUsr.Profile.ImageLocation;
          }
          if (loggedUsr.NeedsPasswordUpdate) {
            this.router.navigate(['/Employee/ProfileMain/ChangePassword']);
          }

          //Ajay 07 Aug 2019 -- Commented code now we are redirection home page either user landing page
          ////needs revision in redirecting part: sud: 21May'18
          //if (res.Results.DefaultPagePath != null) {
          //  //let navigateTo = localStorage.getItem("defaultRoute");
          //  //if (navigateTo == null)
          //  //{
          //  //localStorage.setItem("defaultRoute", res.Results.DefaultPagePath);
          //  this.router.navigate(['/' + res.Results.DefaultPagePath]);
          //  //}

          //}
          //Ajay 07 Aug 2019
          //redirecting to Landing page (selected by user)
          if (res.Results.LandingPageRouteId != null) {
            var path = this.securityService.UserNavigations.find(a => a.RouteId == res.Results.LandingPageRouteId);
            var check = sessionStorage.getItem("isLandingVisited");
            var isLandingVisitedNewTab = localStorage.getItem("isLandingVisitedNewTab");

            if (check != "true" && isLandingVisitedNewTab != "true") {
              if (path) {
                //adding browser session storage for landing page visited
                //if user refresh after login then he will not to be redirect to landing page
                sessionStorage.setItem("isLandingVisited", "true");
                localStorage.setItem('isLandingVisitedNewTab', "true");
                this.router.navigate(['/' + path.UrlFullPath]);
              } else {
                this.router.navigate(['/']);
              }
            }
          }
        }
      },
        err => {
          alert('failed to get the data.. please check log for details.');
          this.logError(err.ErrorMessage);
        });
  }

  onActivate(event) {
    window.scroll(0, 0);

    //When Sliding effect required needs revision
    //var timerID = setInterval(function () {
    //    window.scrollBy(0, -15);
    //    if (window.pageYOffset == 0) {
    //        clearInterval(timerID);
    //    }
    //}, 1);
  }


  GetActiveCounter(): void {
    this.securityBlService.GetActiveBillingCounter()
      .subscribe(res => {
        if (res.Status == 'OK') {
          this.securityService.getLoggedInCounter().CounterId = res.Results;
        }
      },
        err => {
          //alert('failed to get the data.. please check log for details.');
          this.logError(err.ErrorMessage);
        });
  }

  //sud: 20June'20--To Do Later-- Bring ACtive hospital and assign to security service.. 
  // GetActiveAccHospital(): void {
  //   this.securityBlService.GetActiveBillingCounter()
  //     .subscribe(res => {
  //       if (res.Status == 'OK') {
  //         this.securityService.getLoggedInCounter().CounterId = res.Results;
  //       }
  //     },
  //       err => {
  //         //alert('failed to get the data.. please check log for details.');
  //         this.logError(err.ErrorMessage);
  //       });
  // }

  GetAllValidRouteList(): void {
    this.securityBlService.GetAllValidRouteList()
      .subscribe(res => {
        if (res.Status == 'OK') {
          this.securityService.validRouteList = res.Results;
          this.validRoutes = this.securityService.GetAllValidRoutes();
          //  this.securityService.validRouteList[0].ChildRoutes.filter(s => s.DefaultShow == true).length

        }
      },
        err => {
          //alert('failed to get the data.. please check log for details.');
          this.logError(err.ErrorMessage);
        });
  }
  GetActivePharmacyCounter(): void {
    this.securityBlService.GetActivePharmacyCounter()
      .subscribe(res => {
        if (res.Status == 'OK') {
          //sud: 13Sept'18-- assign pharmacy's logged in counter.
          this.securityService.setPhrmLoggedInCounter(res.Results);
        }
      },
        err => {
          //alert('failed to get the data.. please check log for details.');
          this.logError(err.ErrorMessage);
        });
  }

  //Set valid Navigation Route List
  SetValidNavigationRoute(): void {
    this.securityBlService.GetValidNavigationRouteList()
      .subscribe(res => {
        if (res.Status == 'OK') {
          this.securityService.UserNavigations = res.Results;
          //Ajay 07Aug19 -- after response success get logged user info and redirect to its landing page
          this.GetLoggedInUserId();
          this.currUser = this.currentUsr;
        }
      },
        err => {
          alert('failed to get navigation menu data.. please check log for details.');
          this.logError(err.ErrorMessage);
        });
  }
  logError(err: any) {
    console.log(err);
  }


  //set valid permissions of user 
  //Ajay 09-10-2018
  SetValidUserPermissions(): void {
    this.securityBlService.GetValidUserPermissionList()
      .subscribe(res => {
        if (res.Status == 'OK') {
          //set to userpermissions in securityService
          this.securityService.UserPermissions = res.Results;
        }
        else {
          //alert('failed to get user permissions.. please check log for details.');
          window.location.href = '/Account/Logout';
          this.logError(res.ErrorMessage);
        }
      },
        err => {
          alert('failed to get user permissions.. please check log for details.');
          this.logError(err.ErrorMessage);
        });
  }

  public CallBackLoadParameters(res) {
    if (res.Status == "OK") {
      this.coreService.Parameters = res.Results;
      this.coreService.SetTaxLabel();
      this.coreService.SetCurrencyUnit();
      this.setLoadingScreenVal();
      //commented: customername, landingpage, empilabels etc for UAT: sudarshan--13jul2017
      //this.pageParameters.CustomerName = res.Results.filter(a => a.ParameterName == 'CustomerName')[0]["ParameterValue"];
      //this.pageParameters.LandingPageCustLogo = res.Results.filter(a => a.ParameterName == 'LandingPageCustLogo')[0]["ParameterValue"];
      //remove below hardcode value for image path as possible..sudarshan:13Apr'17-- 
      //this.pageParameters.LandingPageCustLogo = "/themes/theme-default/images/hospitals-logo/" + this.pageParameters.LandingPageCustLogo;
      //this.pageParameters.EmpiLabel = res.Results.filter(a => a.ParameterName == 'UniquePatientIdLabelName')[0]["ParameterValue"];

      //this.pageParameters.CustomerName = res.Results.filter(a => a.ParameterName == 'CustomerName')[0];
      //this.pageParameters.Logo
    }
    else {

      window.location.href = '/Account/Logout';
      alert(res.ErrorMessage);
      //console.log(res.ErrorMessage);
    }
  }
 


  DownloadUserManual() {
    this.dlService.ReadExcel("/Home/GetUserManual").map(res => res)
      .subscribe(data => {
        let blob = data;
        let a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = "DanpheEMR-UserManual.pdf";
        document.body.appendChild(a);
        a.click();
      },

        res => {
          alert(res);
        });
  }

  LogoutFromAplication() {
    //Ajay 07 Aug 2019
    //removing landing page from session
    sessionStorage.removeItem("isLandingVisited");
    localStorage.removeItem('isLandingVisitedNewTab');
    //when logged out from one tab, add a key : logout-event to local storage, which will be continuously listened by other windows.
    localStorage.setItem('logout-event', 'logout' + Math.random());
    //after setting localstorage, redirect to Logout page.
    window.location.href = '/Account/Logout';

  }

  // START: VIKAS : default caledar date preference for user 
  openShowDatePreference() {
    this.showDatePopup = true;
  }
  Close() {
    this.showDatePopup = false;
  }
  ChangeDatePreference(e) {
    if (e.target.name == "AD") {
      this.DatePreferenceData('en');
      this.msgBoxServ.showMessage('notice', ['Default English (AD) calendar preference is saved locally. If you want to store permanently click on save']);
    }
    else if (e.target.name == "BS") {
      this.DatePreferenceData('np');
      this.msgBoxServ.showMessage('notice', ['Default Nepali (BS) calendar preference is saved locally. If you want to store permanently click on save']);
    }

  }
  DatePreferenceData(type) {
    if (type == 'np') {
      this.empPre.en = false;
      this.empPre.np = true;
      this.selectedDatePref = "np";
      this.defaultCal = "Nepali (BS)";
      this.coreService.DatePreference = type;
    }
    else {
      this.empPre.np = false;
      this.empPre.en = true;
      this.selectedDatePref = "en";
      this.defaultCal = "English (AD)";
      this.coreService.DatePreference = type;
    }
  }

  SaveEmpPref() {
    this.dlService.Add(this.selectedDatePref, "/api/Core?reqType=post-emp-datepreference")
      .subscribe(res => {
        if (res.Status = "OK") {
          let data = res.Results;
          this.coreService.DatePreference = (data != null) ? data.PreferenceValue : null;
          if (this.coreService.DatePreference != null) {
            this.DatePreferenceData(this.coreService.DatePreference);
          }
          this.msgBoxServ.showMessage('success', ['Saved your date preference']);
          this.Close();
        }
      })
  }
  // END: VIKAS



  LoadAccountingHospitalInfo(): void {
    this.securityBlService.GetAccountingHopitalInfo()
      .subscribe((res: DanpheHTTPResponse) => {
        if (res.Status == 'OK') {
          this.securityService.SetAccHospitalInfo(res.Results);
          this.coreService.GetCodeDetails().subscribe(res => {      
            this.coreService.SetCodeDetails(res);
          });
         
          this.coreService.GetFiscalYearList().subscribe(res => {      
            this.coreService.SetFiscalYearList(res);
          });
        }
      },
        err => {
          alert('failed to get user permissions.. please check log for details.');
          this.logError(err.ErrorMessage);
        });
  }


}
