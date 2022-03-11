import { Component, ChangeDetectorRef } from "@angular/core";
import { RouterOutlet, RouterModule, Router } from "@angular/router";

import { NursingBLService } from "../shared/nursing.bl.service";
import { VisitService } from "../../appointments/shared/visit.service";
import { PatientService } from "../../patients/shared/patient.service";
import { RouteFromService } from "../../shared/routefrom.service";
import GridColumnSettings from "../../shared/danphe-grid/grid-column-settings.constant";
import { GridEmitModel } from "../../shared/danphe-grid/grid-emit.model";

import * as moment from "moment/moment";
import { MessageboxService } from "../../shared/messagebox/messagebox.service";
import { APIsByType } from "../../shared/search.service";
import { CoreService } from "../../core/shared/core.service";
import { SecurityService } from "../../security/shared/security.service";
import { CommonFunctions } from "../../shared/common.functions";
import { Ward } from "../../adt/shared/ward.model";
import { InPatientVM } from "../../labs/shared/InPatientVM";
import { NursingDLService } from "../shared/nursing.dl.service";
import { ADT_DLService } from "../../adt/shared/adt.dl.service";
import { NepaliDateInGridParams, NepaliDateInGridColumnDetail } from "../../shared/danphe-grid/NepaliColGridSettingsModel";
import { take } from "rxjs/operators";
import { DanpheHTTPResponse } from "../../shared/common-models";


@Component({
  selector: "nursing-inpatient",
  templateUrl: "./nursing-inpatient.html",
  styles: [
    `
      .mar-30-bt {
        margin-bottom: 30px;
      }
    `,
  ],
})
export class NursingInPatientComponent {
  public Timer: any;
  public ipdList = [];
  nurIPDGridColumnSettings: Array<any> = null;
  nurFavPatGidColumnSettings: Array<any> = null;
  nurToBeReceivedGridColumnSettings: Array<any> = null;

  public addFavLoading: boolean = false;
  public removeFavLoading: boolean = false;
  public isShowUploadMode: boolean = false;
  public isShowDrugRequest: boolean = false;
  public isShowListMode: boolean = false;
  public showDocumentsDetails: boolean = false;
  public patientId: number = null;
  public fromDate: string = "";
  public toDate: string = "";
  public globalPatient: any;
  public globalVisit: any;
  public patGirdDataApi: string = "";
  public showIpDrugsRequest: boolean = false;
  searchText: string = "";
  public enableServerSideSearch: boolean = false;
  nursingGridCol: NursingGridColSetting = null;
  public showActiveWardInfo: boolean;

  public showTransferPage: boolean = false;
  public showVitalsList: boolean = false;
  public showWardBilling: boolean = false;
  public FavoritePatients: Array<InPatientVM> = new Array<InPatientVM>();
  public FavoritePatientIds: Array<number> = new Array<number>();
  public FilteredIDPPatientGridData: Array<InPatientVM> = null;
  public InitialFavPatient: number = null;

  public selectedBedInfo: {
    PatientAdmissionId;
    PatientId;
    PatientVisitId;
    MSIPAddressInfo;
    PatientCode;
    DischargedDate;
    Name;
    AdmittingDoctor;
    AdmittingDoctorName;
    BedInformation: {
      BedId;
      PatientBedInfoId;
      Ward;
      BedFeature;
      BedCode;
      BedNumber;
      BedFeatureId;
      AdmittedDate;
      WardId;
      StartedOn;
    };
  };

  public NepaliDateInGridSettings: NepaliDateInGridParams = new NepaliDateInGridParams();
  public IsReceiveFeatureEnabled: boolean = false;

  public showInPatGrid: boolean = false;

  public showReceiveNote: boolean = false;

  public showFavPatGrid: boolean = false;
  public showAllPatGrid: boolean = false;
  public hasFav: boolean = false;
  public SelectedDepartmentId: number = 0;
  private data: Array<any> = [];
  public showPoliceCase: boolean = false;

  constructor(
    public nursingBLService: NursingBLService,
    public nursingDLService: NursingDLService,
    public changeDetector: ChangeDetectorRef,
    public patientService: PatientService,
    public visitService: VisitService,
    public router: Router,
    public routeFromSrv: RouteFromService,
    public msgBoxServ: MessageboxService,
    public coreService: CoreService,
    public securityService: SecurityService,
    public admissionBLService: ADT_DLService
  ) {
    this.fromDate = moment().format("YYYY-MM-DD");
    this.toDate = moment().format("YYYY-MM-DD");
    this.getParamter();
    this.NepaliDateInGridSettings.NepaliDateColumnList.push(
      new NepaliDateInGridColumnDetail("AdmittedDate", true)
    );
    this.nursingGridCol = new NursingGridColSetting(
      this.securityService,
      this.IsReceiveFeatureEnabled
    );
    this.nurIPDGridColumnSettings = this.nursingGridCol.NurIPDList;
    this.nurFavPatGidColumnSettings = this.nursingGridCol.NurFavPatList;
    this.patGirdDataApi = APIsByType.NursingInpatient;

    this.nurFavPatGidColumnSettings = this.nursingGridCol.NurFavPatList;

    this.LoadIPDList(this.searchText);
    //this.GetFavoritesList();
    this.Timer = setInterval(() => {
      this.LoadIPDList(this.searchText);
      this.ipdList = this.ipdList.slice();

    }, 60000);
    this.LoadDepartments();
  }
  ngOnDestroy() {
    clearInterval(this.Timer);
  }
  serverSearchTxt(searchTxt) {
    this.searchText = searchTxt;
    this.LoadIPDList(this.searchText);
  }

  getParamter() {
    let parameterData = this.coreService.Parameters.find(
      (p) =>
        p.ParameterGroupName == "Common" &&
        p.ParameterName == "ServerSideSearchComponent"
    ).ParameterValue;
    var data = JSON.parse(parameterData);
    this.enableServerSideSearch = data["NursingInPatient"];

    this.IsReceiveFeatureEnabled = this.coreService.IsReserveFeatureEnabled();
  }
  //today's all visit or all visits with IsVisitContinued status as false
  LoadIPDList(searchText): void {
    this.showInPatGrid = false;
    var wardId = this.securityService.getActiveWard().WardId;
    let allPat = document.getElementById('all');
    let favPat = document.getElementById('fav');
    this.nursingBLService
      .GetAdmittedList(this.fromDate, this.toDate, searchText, wardId)
      .subscribe((res) => {
        if (res.Status == "OK") {
          if(this.showPoliceCase == true){
            this.ipdList = res.Results.filter(ip => ip.IsPoliceCase == true);
          }else {
            this.ipdList = res.Results;
          }
          //this.ipdList = res.Results;
          this.admissionBLService.GetNursingEmployeeFavorites().subscribe((res) => {
            if (res.Status == "OK" && res.Results != null) {
              this.FavoritePatientIds = res.Results;
              for (var i = 0; i < this.FavoritePatientIds.length; i++) {

                if(this.showPoliceCase == true){
                  var favpat = this.FavoritePatients.concat(
                    this.ipdList.filter(
                      (a) => a.PatientVisitId == this.FavoritePatientIds[i]
                    )
                  );
                  this.FavoritePatients = favpat.filter(a => a.IsPoliceCase == true)
                }else {
                  this.FavoritePatients = this.FavoritePatients.concat(
                    this.ipdList.filter(
                      (a) => a.PatientVisitId == this.FavoritePatientIds[i]
                    )
                  );
                }
                
              }
              if (this.FavoritePatients) {
                this.hasFav = true;
              }
              if ((allPat == null) && (this.FavoritePatients.length > 0)) {
                this.showFavorites();
              }
              else if (allPat && allPat.classList.contains('active')) {
                this.showAllPatients();
              } else if (favPat && favPat.classList.contains('active')) {
                this.showFavorites();
              } else if (allPat == null && favPat == null && !this.FavoritePatients) {
                this.showAllPatients();
              }
            }
          });
          if (allPat == null && favPat == null) {
            this.showAllPatients();
          }
          this.GetFavoritesList();
          this.showInPatGrid = true;
        } else {
          this.msgBoxServ.showMessage("failed", [res.ErrorMessage]);
        }
      });
  }

  LoadFavPatList(searchText): void {
    this.showFavPatGrid = false;
    var wardId = this.securityService.getActiveWard().WardId;
  }

  GetFavoritesList() {
    this.admissionBLService.GetNursingEmployeeFavorites().subscribe(
      (res) => {
        if (res.Status == "OK") {
          if (res.Results != null) {
            this.FavoritePatientIds = res.Results;
            this.FavoritePatients = [];
            for (var i = 0; i < this.FavoritePatientIds.length; i++) {

              this.FavoritePatients = this.FavoritePatients.concat(
                this.ipdList.filter(
                  (a) => a.PatientVisitId == this.FavoritePatientIds[i]
                )
              );
              this.ipdList.map((a) => {
                if (a.PatientVisitId == this.FavoritePatientIds[i]) {
                  a.IsFavorite = true;
                }
              });
            }
          }
          this.ipdList = this.ipdList.slice();
          this.FavoritePatients = this.FavoritePatients.slice();
          this.changeDetector.detectChanges();
          this.FilteredIDPPatientGridData = this.ipdList.slice();
        } else {
          this.msgBoxServ.showMessage("error", [res.ErrorMessage]);
        }
      },
      (err) => {
        this.msgBoxServ.showMessage("error", [err.ErrorMessage]);
      }
    );
  }

  NurIPDListGridActions($event: GridEmitModel) {
    switch ($event.Action) {
      case "orders":
        {
          if ($event.Data) {
            this.routeFromSrv.RouteFrom = "nursing";
            this.SetPatDataToGlobal($event.Data);
            this.showWardBilling = true;
          }
        }
        break;

      case "clinical":
        {
          if ($event.Data) {
            this.SetPatDataToGlobal($event.Data);
            this.router.navigate(["/Nursing/Clinical"]);
          }
        }
        break;

      case "patient-overview":
        {
          if ($event.Data) {
            this.SetPatDataToGlobal($event.Data);
            this.routeFromSrv.RouteFrom = "nursing";
            this.router.navigate(["/Nursing/PatientOverviewMain"]);
          }
        }
        break;

      case "vitals":
        {
          if ($event.Data) {
            this.SetPatDataToGlobal($event.Data);
            this.showVitalsList = true;
          }
        }
        break;
      case "addfavorite":
        {
          console.log(this.addFavLoading);
          if (!this.addFavLoading && !$event.Data.IsFavorite) {
            console.log(this.addFavLoading);
            this.addFavLoading = true;
            let patientVisitId = $event.Data.PatientVisitId;
            var wardId = this.securityService.getActiveWard().WardId;
            let itemId = JSON.stringify($event.Data.PatientVisitId);
            let preferenceType = "Nursing";
            if (this.addFavLoading && !$event.Data.IsFavorite) {
              this.nursingBLService
                .AddToFavorites(itemId, preferenceType, wardId)
                .subscribe((res) => {
                  if (res.Status == "OK") {
                    this.FavoritePatientIds.push(res.Results);
                    this.FavoritePatients = this.FavoritePatients.concat(
                      this.ipdList.filter(
                        (a) => a.PatientVisitId == res.Results
                      )
                    );

                    this.ipdList.map((a) => {
                      if (a.PatientVisitId == patientVisitId) {
                        a.IsFavorite = true;
                      }
                    });
                    this.FilteredIDPPatientGridData.map((a) => {
                      if (a.PatientVisitId == patientVisitId) {
                        a.IsFavorite = true;
                      }
                    });
                    this.ipdList = this.ipdList.slice();
                    this.FilteredIDPPatientGridData = this.FilteredIDPPatientGridData.slice();
                    //this.changeDetector.detectChanges();
                    //this.GetFavoritesList();
                    this.addFavLoading = false;

                  } else {
                    console.log(
                      "couldn't add to favourite. Error_Message: " +
                      res.ErrorMessage
                    );

                    this.addFavLoading = false;
                  }
                });
            }
          }

        } break;
      case "removefavorite": {
        //console.log(this.loading);
        if (!this.removeFavLoading && $event.Data.IsFavorite) {
          this.removeFavLoading = true;
          let patientVisitId = $event.Data.PatientVisitId;
          let itemId = JSON.stringify($event.Data.PatientVisitId);
          let preferenceType = "Nursing";
          var wardId = this.securityService.getActiveWard().WardId;

          if (this.removeFavLoading && $event.Data.IsFavorite) {
            this.nursingDLService
              .RemoveFromFavorites(itemId, preferenceType, wardId)
              .subscribe((res) => {
                if (res.Status == "OK") {
                  this.FavoritePatientIds = this.FavoritePatientIds.filter(
                    (a) => a != patientVisitId
                  );
                  this.FavoritePatients = this.FavoritePatients.filter(
                    (a) => a.PatientVisitId != patientVisitId
                  );
                  this.ipdList.map((a) => {
                    if (a.PatientVisitId == patientVisitId) {
                      a.IsFavorite = false;
                    }
                  });
                  this.FilteredIDPPatientGridData.map((a) => {
                    if (a.PatientVisitId == patientVisitId) {
                      a.IsFavorite = false;
                    }
                  });
                  this.ipdList = this.ipdList.slice();
                  this.FilteredIDPPatientGridData = this.FilteredIDPPatientGridData.slice();
                  this.changeDetector.detectChanges();
                  this.removeFavLoading = false;
                } else {
                  this.removeFavLoading = false;
                  console.log(
                    "couldn't remove from favourite. Error_Message: " +
                    res.ErrorMessage
                  );
                }
              });
          }
        }

      } break;
      case "receive":
        {
          if ($event.Data) {
            this.SetPatDataToGlobal($event.Data);
            var selectedBedInfo = Object.create($event.Data);
            this.selectedBedInfo = selectedBedInfo;
            this.showReceiveNote = true;
          }
        }
        break;

      case "transfer":
        {
          if ($event.Data) {
            var selectedBedInfo = Object.create($event.Data);

            this.showTransferPage = false;
            this.changeDetector.detectChanges();
            this.selectedBedInfo = selectedBedInfo;
            this.showTransferPage = true;
          }
        }
        break;

      // case "upload-files":
      //   {
      //     if ($event.Data) {
      //       this.isShowUploadMode = true;
      //       this.isShowListMode = false;
      //       this.patientId = $event.Data.PatientId;
      //       this.showDocumentsDetails = true;
      //     }
      //   }
      //   break;

      // case "drugs-request":
      //   {
      //     if ($event.Data) {
      //       this.SetPatDataToGlobal($event.Data);
      //       this.isShowDrugRequest = true;
      //       this.routeFromSrv.RouteFrom = "nursing";
      //       this.router.navigate(["/Nursing/DrugsRequest"]);
      //     }
      //   }
      //   break;
    }
  }

  //Place Nursing order against patient
  public SetPatDataToGlobal(data): void {
    this.globalPatient = this.patientService.CreateNewGlobal();
    this.globalPatient.PatientId = data.PatientId;
    this.globalPatient.PatientCode = data.PatientCode;
    this.globalPatient.ShortName = data.Name;
    this.globalPatient.DateOfBirth = data.DateOfBirth;
    this.globalPatient.Gender = data.Gender;
    this.globalPatient.Age = data.Age;
    this.globalPatient.Address = data.Address;
    this.globalPatient.PhoneNumber = data.PhoneNumber;

    this.globalPatient.Admissions.AdmissionDate = data.AdmittedDate;
    this.globalPatient.IsPoliceCase = data.IsPoliceCase;

    this.globalVisit = this.visitService.CreateNewGlobal();
    this.globalVisit.PatientVisitId = data.PatientVisitId;
    this.globalVisit.PatientId = data.PatientId;
    this.globalVisit.ProviderId = data.AdmittingDoctorId;
    this.globalVisit.VisitType = "inpatient";
    this.globalVisit.ProviderName = data.AdmittingDoctorName;
    this.globalVisit.VisitDate = data.AdmittedDate;
    // this.globalVisit.VisitType = data.VisitType;//sud:13June-this was coming undefined.
  }

  //sanjit: showing active ward side bar
  ShowInfo() {
    this.showActiveWardInfo = true;
    var timer = setInterval(() => {
      this.CloseInfo();
      clearInterval(timer);
    }, 10000);
  }
  CloseInfo() {
    this.showActiveWardInfo = false;
  }
  UnsetGlobalWard() {
    this.securityService.setActiveWard(new Ward());
    this.showActiveWardInfo = false;
    this.router.onSameUrlNavigation = "reload";
    this.router.navigate(["/Nursing/InPatient"]);
  }
  TransferUpgrade($event) {
    this.ClosePopUp();
    this.LoadIPDList("");
  }

  public ClosePopUp() {
    this.patientService.CreateNewGlobal();
    this.visitService.CreateNewGlobal();
    this.showTransferPage = false;
    this.showVitalsList = false;
    this.showWardBilling = false;
    this.showVitalsList = false;
    this.showReceiveNote = false;
  }

  public ReceiveNoteCallback(data) {
    if (data) {
      this.ClosePopUp();
    }
    this.LoadIPDList("");
  }
  //show and hide all and my patient
  public showAllPatients() {
    this.showAllPatGrid = true;
    this.showFavPatGrid = false;
    let allPat = document.getElementById('all');
    let favPat = document.getElementById('fav');
    allPat.classList.add('active');
    favPat.classList.remove('active');
  }
  public showFavorites() {
    this.showFavPatGrid = true;
    this.showAllPatGrid = false;
    let favPat = document.getElementById('fav');
    let allPat = document.getElementById('all');
    favPat.classList.add('active');
    allPat.classList.remove('active');
  }
  public checkValue(event){
    if(event == true){
      this.showPoliceCase = true;
      this.LoadIPDList(this.searchText);
    }else{
      this.showPoliceCase = false;
      this.LoadIPDList(this.searchText);
    }
  }
  
  public allDepartments: Array<any> = [];
  public LoadDepartments() {
    this.admissionBLService.GetDepartments()
      .subscribe((res: DanpheHTTPResponse) => {
        this.allDepartments = res.Results;

      });
  }
}

export class NursingGridColSetting {
  static serv: any;
  static isReceiveEnabled: any;
  showAllPat: boolean = false;
  constructor(
    public securityService: SecurityService,
    public receiveEnabled: boolean
  ) {
    NursingGridColSetting.serv = this.securityService;
    NursingGridColSetting.isReceiveEnabled = this.receiveEnabled;
  }

  public NurIPDList = [
    {
      headerName: "Admitted Date",
      field: "AdmittedDate",
      width: 90,
      sort: "desc",
      cellRenderer: this.AdmissionDateRenderer,
    },
    { headerName: "Hospital Number", field: "PatientCode", width: 80 },
    { headerName: "IP Number", field: "VisitCode", width: 80 },
    { headerName: "", field: "", width: 35, cellRenderer: this.InsPatientIconRenderer },
    { headerName: "Name", field: "Name", width: 150 },
    {
      headerName: "Age/Sex",
      field: "",
      width: 70,
      cellRenderer: this.AgeSexRendererPatient,
    },
    {
      headerName: "Bed Detail",
      field: "",
      cellRenderer: this.BedDetailRenderer,
      width: 110,
    },
    // {
    //   headerName: "Police Case ?",
    //   field: "IsPoliceCase",
    //   width: 90,
    //   cellRenderer: this.PoliceCaseRenderer,
    // },
    {
      headerName: "Actions",
      field: "",
      width: 250,
      cellRenderer: this.GetNursingActionsByPermission,
    },
  ];

  InsPatientIconRenderer(params) {
    var template = "";
    if (params.data.IsInsurancePatient) {
      template = `<img title="Insurance Patient" style="width:24px;height:24px;" src='/themes/theme-default/images/insurance-patient-icon.png'></img>`;
    }
    return template;
  }

  GetNursingActionsByPermission(params) {
    let tmplate = "";
    let currPatient = params.data;
    if (NursingGridColSetting.serv.HasPermission("nursing-ip-summary-view")) {
      tmplate += `<i danphe-grid-action="patient-overview" class="fa fa-tv grid-action" style="padding: 3px;" title= "overview"></i>`;
    }

    if (
      NursingGridColSetting.serv.HasPermission("nursing-ip-wardbilling-view")
    ) {
      tmplate += ` <a danphe-grid-action="orders" class="grid-action" title="Click to add Orders">
                        Ward Request
                    </a>`;
    }

    if (NursingGridColSetting.serv.HasPermission("nursing-transfer-view")) {
      tmplate += ` <a danphe-grid-action="transfer" class="grid-action" title="Click to transfer">
                        Transfer
                    </a>`;
    }

    tmplate += `<a danphe-grid-action="vitals" class="grid-action" title="Add patient vitals">
                        Vitals
                    </a>`;
    //for favourite patients
    if (currPatient.IsFavorite) {
      tmplate +=
        '<a danphe-grid-action="removefavorite" class="fa fa-heart" style="font-size:17px;top:-1px;padding: 5px;" title="remove favorite" ></a>';
    } else {
      tmplate +=
        '<a danphe-grid-action="addfavorite" class="fa fa-heart-o" style="font-size:17px;top:-1px;padding: 5px" title="add favorite"></a>';
    }

    if (NursingGridColSetting.isReceiveEnabled) {
      if (
        NursingGridColSetting.serv.HasPermission(
          "nursing-receive-transferred-patient"
        )
      ) {
        if (
          (params.data.BedInformation.Action == "transfer" &&
            params.data.BedInformation.ReceivedBy == null &&
            params.data.BedInformation.BedOnHoldEnabled) ||
          (params.data.BedInformation.Action == "admission" &&
            params.data.BedInformation.ReceivedBy == null)
        ) {
          tmplate = ` <a danphe-grid-action="receive" class="animated-btn blinking-btn-warning grid-action" title="Receive Transferred Patient">
                        Receive
                    </a>`;
        }
      }
    }
    return tmplate;
  }

  public NurFavPatList = [
    {
      headerName: "Admitted Date",
      field: "AdmittedDate",
      width: 90,
      sort: "desc",
      cellRenderer: this.AdmissionDateRenderer,
    },
    { headerName: "Hospital Number", field: "PatientCode", width: 80 },
    { headerName: "IP Number", field: "VisitCode", width: 80 },
    { headerName: "Name", field: "Name", width: 150 },
    {
      headerName: "Age/Sex",
      field: "",
      width: 70,
      cellRenderer: this.AgeSexRendererPatient,
    },
    {
      headerName: "Bed Detail",
      field: "BedInf",
      cellRenderer: this.BedDetailRenderer,
      width: 110,
    },
    {
      headerName: "Actions",
      field: "",
      width: 500,
      cellRenderer: this.GetNursingActionsByPermission,
    },
  ];

  public AdmissionDateRenderer(params) {
    let date: string = params.data.AdmittedDate;
    return moment(date).format("YYYY-MM-DD HH:mm");
  }
  public BedDetailRenderer(params) {
    params.data['BedInf'] = params.data.BedInformation.BedFeature +
      "/" +
      params.data.BedInformation.BedCode;
    return (
      params.data['BedInf']
    );
  }
  public AgeSexRendererPatient(params) {
    let dob = params.data.DateOfBirth;
    let gender: string = params.data.Gender;
    return CommonFunctions.GetFormattedAgeSex(dob, gender);
  }

  public PoliceCaseRenderer(params){
    let policeCase = params.data.IsPoliceCase;
    if(policeCase == true){
      let template =
        `<span style="color:red; font-weight:bold;">&nbsp;&nbsp;&nbsp; YES &nbsp;&nbsp;&nbsp;</span>`
      return template
    }else {
      let template =
        `
                    <span>&nbsp;&nbsp;&nbsp; NO &nbsp;&nbsp;&nbsp;</span>
                `
      return template
    }
  }
}
