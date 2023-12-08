import { ChangeDetectorRef, Component } from '@angular/core';
import { Router } from '@angular/router';
import { PatientService } from "../../patients/shared/patient.service";
import { VisitBLService } from '../shared/visit.bl.service';
import { Visit } from "../shared/visit.model";
import { VisitService } from '../shared/visit.service';
//needed only to clear previously selected appointment when navigating within Appointment Module
import * as moment from 'moment/moment';
import { CoreService } from '../../core/shared/core.service';
import { SecurityService } from '../../security/shared/security.service';
import { CallbackService } from '../../shared/callback.service';
import { CommonFunctions } from '../../shared/common.functions';
import GridColumnSettings from '../../shared/danphe-grid/grid-column-settings.constant';
import { GridEmitModel } from "../../shared/danphe-grid/grid-emit.model";
import { MessageboxService } from '../../shared/messagebox/messagebox.service';
import { SearchService } from '../../shared/search.service';
import { VisitGenericStickerModel } from '../../shared/visit-generic-stickers/visit-generic-sticker.model';
import { AppointmentService } from '../shared/appointment.service';

@Component({
  templateUrl: "./list-visit.html", //"/AppointmentView/ListVisit",
  host: { '(window:keydown)': 'hotkeys($event)' }
})

export class VisitListComponent {

  visits: Array<Visit> = new Array<Visit>();
  visitGridColumns: Array<any> = null;

  //public showTransferPage: boolean = false;//sud:27June'19--Transfer is now done from new-visit page with conditions..
  public showFollowupPage: boolean = false;
  public showOpdSticker: boolean = false;
  public showEchsSticker: boolean = false;
  public selectedVisit: Visit = new Visit();
  public selectedIndex: number = null;
  public maxLastVisitDays: number = null;
  public currentCounter: number = null;
  public showERSticker: boolean = false;
  public showGenericSticker: boolean = false;//sud:19Nov'18--for Generic Stickers.
  public patVisitGenericStickerInfo: VisitGenericStickerModel = new VisitGenericStickerModel();//sud:19Nov'18--for Generic Stickers.
  public showReferralPopup: boolean = false;//sud:3June'19--needed for Free-Referral, our current flow doesn't have such.
  public patGirdDataApi: string = "";
  public patientVisitId: number;
  public status: string = "";
  public searchText: string = '';
  public immDeptName: string = "";
  public enableServerSideSearch: boolean = false;
  public showDob: boolean;
  public bil_InvoiceNo: number = 0;
  public bil_FiscalYrId: number = 0;
  public bil_BilTxnId: number = null;
  public IsHospitalNoSearch: boolean = false; //This flag is send to server.
  public SearchPatientUsingHospitalNo: boolean = false;
  public IsIdCardNoSearch: boolean = false; //This flag is send to server.
  public SearchPatientUsingIdCardNo: boolean = false;
  public showSticker: boolean = false;
  public MembershipTypeName: string = null;
  public maxInternalReferralDays: number = 0;

  constructor(
    public visitService: VisitService,
    public patientService: PatientService,
    public appointmentService: AppointmentService,
    public visitBlService: VisitBLService,
    public callbackService: CallbackService,
    public changeDetector: ChangeDetectorRef,
    public router: Router,
    public msgBoxServ: MessageboxService,
    public securityService: SecurityService,
    public coreService: CoreService,
    public _searchService: SearchService) {
    this.immDeptName = this.coreService.GetImmunizationDepartmentName().toLowerCase();
    this.currentCounter = this.securityService.getLoggedInCounter().CounterId;

    if (this.currentCounter < 1) {
      this.callbackService.CallbackRoute = '/Appointment/ListVisit';
    }
    else {
      this.status = "initiated";
      this.loadMaximumLastVisitDays();
      //this.selectedVisit=this.visitService.CreateNewGlobal();
      this.appointmentService.CreateNewGlobal(); //needed only to clear previously selected appointment
      this.getParamter();
      this.LoadVisitList("");
      this.visitGridColumns = GridColumnSettings.VisitSearch;

      // this.patGirdDataApi = APIsByType.VisitList;

      this._searchService.status = this.status;
      this._searchService.maxdayslimit = this.maxLastVisitDays;
    }

  }


  ngAfterViewInit() {
    document.getElementById('quickFilterInput').focus();
  }

  //   serverSearchTxt(searchTxt) {
  //     let searchTextData = searchTxt;
  //     if(this.isStringJson(searchTextData)){
  //         searchTextData = JSON.parse(searchTextData);
  //         if(searchTextData && searchTextData.text && searchTextData.searchUsingHospitalNo){
  //             this.searchText = searchTextData.text;
  //             this.IsHospitalNoSearch = searchTextData.searchUsingHospitalNo;
  //             this.LoadVisitList(this.searchText);
  //         }else{
  //             this.searchText = searchTextData;
  //             this.IsHospitalNoSearch = false;
  //             this.LoadVisitList(this.searchText);
  //         }
  //     }else{
  //         this.searchText = searchTextData;
  //         this.IsHospitalNoSearch = false;
  //         this.LoadVisitList(this.searchText);
  //     }
  // }


  serverSearchTxt(searchTxt) {
    let searchTextData = searchTxt;
    if (this.isStringJson(searchTextData)) {
      searchTextData = JSON.parse(searchTextData);
      if (searchTextData && searchTextData.text && searchTextData.searchUsingHospitalNo) {
        this.searchText = searchTextData.text;
        this.IsHospitalNoSearch = searchTextData.searchUsingHospitalNo;
        this.IsIdCardNoSearch = false;
        this.LoadVisitList(this.searchText);
      } else if (searchTextData && searchTextData.text && searchTextData.searchUsingIdCardNo) {
        this.searchText = searchTextData.text;
        this.IsIdCardNoSearch = searchTextData.searchUsingIdCardNo;
        this.IsHospitalNoSearch = false;
        this.LoadVisitList(this.searchText);
      } else {
        this.searchText = searchTextData;
        this.IsHospitalNoSearch = false;
        this.IsIdCardNoSearch = false;
        this.LoadVisitList(this.searchText);
      }
    } else {
      this.searchText = searchTextData;
      this.IsHospitalNoSearch = false;
      this.IsIdCardNoSearch = false;
      this.LoadVisitList(this.searchText);
    }
  }

  isStringJson(str) {
    try {
      JSON.parse(str);
    } catch (e) {
      return false;
    }
    return true;
  }
  getParamter() {
    let parameterData = this.coreService.Parameters.find(p => p.ParameterGroupName == "Common" && p.ParameterName == "ServerSideSearchComponent").ParameterValue;
    var data = JSON.parse(parameterData);
    this.enableServerSideSearch = data["VisitList"];

    let parameterToSearchUsingHospNo = this.coreService.Parameters.find(a => a.ParameterGroupName == "Appointment" && a.ParameterName == "SearchPatientUsingHospitalNo");
    if (parameterToSearchUsingHospNo) {
      let obj = JSON.parse(parameterToSearchUsingHospNo.ParameterValue);
      this.SearchPatientUsingHospitalNo = obj.SearchPatientUsingHospitalNumber;
      this.IsHospitalNoSearch = false;
    }
    let parameterToSearchUsingIdCardNo = this.coreService.Parameters.find(a => a.ParameterGroupName == "Appointment" && a.ParameterName == "SearchPatientUsingIdCardNo");
    if (parameterToSearchUsingIdCardNo) {
      let obj = JSON.parse(parameterToSearchUsingIdCardNo.ParameterValue);
      this.SearchPatientUsingIdCardNo = obj.SearchPatientUsingIdCardNo;
      this.IsIdCardNoSearch = false;
    }
  }
  //today's all visit or all visits with IsVisitContinued status as false
  LoadVisitList(searchTxt): void {
    this.visitBlService.GetVisits(this.maxLastVisitDays, searchTxt, this.IsHospitalNoSearch, this.IsIdCardNoSearch)
      .subscribe(res => {
        if (res.Status == "OK") {
          this.visits = res.Results;
          if (this.visits && this.visits.length > 0) {
            this.visits.map(a => a.MaxInternalReferralDays = this.maxInternalReferralDays);
          }
        }
        else {
          this.msgBoxServ.showMessage("failed", [res.ErrorMessage]);

        }
      });
  }
  //SelectVisit(vis: Visit) {
  //    let currVisit = this.visitService.getGlobal();
  //    let currPatient = this.patientService.getGlobal();
  //    currPatient.PatientId = vis.PatientId; //patient needed in problems part
  //    currPatient.EMPI = vis.Patient.EMPI;
  //    currVisit.PatientId = vis.PatientId;
  //    currVisit.PatientVisitId = vis.PatientVisitId;
  //    currVisit.ProviderName = vis.ProviderName;
  //    currVisit.ProviderId = vis.ProviderId;
  //    currPatient.FirstName = vis.Patient.FirstName;
  //    currPatient.LastName = vis.Patient.LastName;
  //    currPatient.Gender = vis.Patient.Gender;
  //    currPatient.DateOfBirth = vis.Patient.DateOfBirth;
  //    currPatient.ShortName = vis.Patient.ShortName;
  //}
  CheckCounterActivete() {

  }

  VisitGridActions($event: GridEmitModel) {
    switch ($event.Action) {
      case "referral":
        {

          var selectedVisit = Object.create($event.Data);
          let todaysdate = moment().format('YYYY-MM-DD');
          let visitdate = moment($event.Data.VisitDate).format('YYYY-MM-DD');

          if ((moment(visitdate).diff(todaysdate)) <= 0) {

            this.selectedVisit = selectedVisit;
            this.visitService.appointmentType = "Referral";
            this.visitService.ParentVisitInfo = selectedVisit;

            //this.visitService.globalVisit.PatientVisitId = $event.Data.PatientVisitId;
            //this.visitService.globalVisit.ProviderId = $event.Data.ProviderId;
            //this.AssignPatientToGlobal($event.Data.Patient);
            this.AssignPatientToGlobal($event.Data);


            //start: sud: 3June'19--Decide whether to go for paid-referral or free-referral.
            let isRefChargeApplicable = false;
            let refChargeParam = this.coreService.Parameters.find(p => p.ParameterGroupName === "Billing" && p.ParameterName === "ReferralChargeApplicable");
            if (refChargeParam) {
              isRefChargeApplicable = JSON.parse(refChargeParam.ParameterValue);
            }

            if (isRefChargeApplicable) {
              this.router.navigate(['/Appointment/Visit']);
            }
            else {
              this.showReferralPopup = true;
            }

            //end: sud: 3June'19--Decide whether to go for paid-referral or free-referral.

          }
          else {
            this.msgBoxServ.showMessage("failed", ["Only past or today's visit can be referred to another doctor."]);
          }
          break;

        }
      case "followup":
        {
          var selectedVisit = Object.create($event.Data);
          let todaysdate = moment().format('YYYY-MM-DD');
          let visitdate = moment($event.Data.VisitDate).format('YYYY-MM-DD');

          //console.log(selectedVisit);

          if (moment().diff(moment(visitdate), 'days') > this.maxLastVisitDays) {
            // alert("Free followup days has passed. This will be a paid appointment.");

            let goToPaidFollowup = window.confirm("Free followup days has passed. This will be a paid appointment.");
            if (goToPaidFollowup) {

              this.visitService.appointmentType = "New";//sud:16Jul'19-- appointment type will be new here..

              let selPat = selectedVisit.Patient;
              let pat = this.patientService.getGlobal();
              Object.keys(selPat).forEach(property => {
                if (property in pat) {
                  pat[property] = selPat[property];
                }
              });

              pat.DateOfBirth = moment(pat.DateOfBirth).format('YYYY-MM-DD');
              this.router.navigate(["/Appointment/Visit"]);

            }

          }
          else {
            //only today's or past visit can be followed up, future visit cannot be followed up.
            //we can improve followup logic by allowing followup for only those visits that has visit status as final.
            //all visits has status as inititated for now so using this logic.
            if ((moment(visitdate).diff(todaysdate)) < 0) {
              //those visits that are already transfered or followed up(incase provider is not changed) cannot be continued.
              //only the leaf visit can be transfered or followd up


              this.selectedIndex = $event.RowIndex;
              this.selectedVisit = $event.Data;

              //start: sud: 20June'19--decide whether to go for paid followup or free.//this may not be needed.
              let isPaidFollowupEnabled = false;
              let paidFollUpParam = this.coreService.Parameters.find(p => p.ParameterGroupName == "Appointment" && p.ParameterName == "EnablePaidFollowup");
              if (paidFollUpParam) {
                isPaidFollowupEnabled = paidFollUpParam.ParameterValue == "true" ? true : false;
                //isRefChargeApplicable = refChargeParam.ParameterValue == "true" ? true : false;
              }
              this.showFollowupPage = false;
              this.changeDetector.detectChanges();
              this.showFollowupPage = true;

              //end: sud: 20June'19--decide whether to go for paid followup or free.
            }
            else {
              this.msgBoxServ.showMessage("failed", ["Only past visit can be followed up."]);
            }

          }


          break;
        }
      case "printsticker":
        {
          this.showGenericSticker = false;//sud:19Nov'18--to hide Generic sticker on other action.
          //this.selectedVisit = this.visitService.CreateNewGlobal();


          this.showDob = $event.Data && $event.Data.DepartmentName && ($event.Data.DepartmentName.toLowerCase() == this.immDeptName);

          let selectedVisit = Object.create($event.Data);
          //this.MembershipTypeName = $event.Data.MembershipTypeName;
          this.showOpdSticker = false;

          this.changeDetector.detectChanges();
          this.selectedVisit = this.visitService.CreateNewGlobal();
          this.selectedVisit.PatientVisitId = selectedVisit.PatientVisitId;
          this.selectedVisit.QueueNo = selectedVisit.QueueNo;

          this.selectedVisit.PatientId = selectedVisit.PatientId;
          this.showOpdSticker = true;
          this.showSticker = true;

        }
        break;
      case "generic-sticker":
        {
          this.patVisitGenericStickerInfo = this.MapVisitGenericSticker($event.Data);
          this.showGenericSticker = false;
          this.changeDetector.detectChanges();
          this.showGenericSticker = true;
        }
        break;

      default:
        break;
    }
  }
  AssignPatientToGlobal(_patient) {
    var patient = this.patientService.CreateNewGlobal();
    Object.keys(_patient).forEach(property => {
      if (property in patient) {
        patient[property] = _patient[property];
      }
    });

    patient.IDCardNumber = _patient.IDCardNumber;
    patient.DependentId = _patient.DependentId;
    patient.Rank = _patient.Rank;
    patient.Posting = _patient.Posting;
    patient.SSFPolicyNo = _patient.PolicyNo;
    patient.PolicyNo = _patient.PolicyNo;
    patient.LatestVisitId = _patient.PatientVisitId
    patient.PriceCategoryId = _patient.PriceCategoryId;
    patient.SchemeId = _patient.SchemeId;

  }
  //PrintSticker(row): void {

  //    var patient = this.patientService.CreateNewGlobal();
  //    patient.ShortName = row.ShortName;
  //    patient.EMPI = row.EMPI;
  //    patient.DateOfBirth = row.DateOfBirth;
  //    patient.PhoneNumber = row.PhoneNumber;
  //    patient.PatientId = row.PatientId;
  //    this.GetVisitforStickerPrint(this.selectedVisit.PatientVisitId);
  //}
  //GetVisitforStickerPrint(PatientVisitId) {
  //    //this.selectedVisit = this.visitService.CreateNewGlobal()
  //    this.visitBlService.GetVisitInfoforStickerPrint(PatientVisitId)
  //        .subscribe(res => this.CallBackStickerOnly(res));
  //}
  //CallBackStickerOnly(res) {
  //    this.selectedVisit = this.visitService.CreateNewGlobal();

  //    this.router.navigate(['/Appointment/PrintSticker']);

  CallBackContinueVisit($event) {
    //unshift adds to the top of the array.
    this.visits[this.selectedIndex].IsVisitContinued = true;
    this.visits.unshift($event.visit);
    //returns fresh copy of the array, inorder to notify angular some change is made in the array.
    this.visits = this.visits.slice();
    this.changeDetector.detectChanges();
  }

  //this is to close the opd sticker which is a reuseable component and it is used in visit-list.......
  Close_OPD_Sticker_Popup() {
    this.showOpdSticker = false;
  }

  Close_ECHS_Sticker_Popup() {
    this.showEchsSticker = false;
  }

  Close_ER_Sticker_Popup() {
    this.showERSticker = false;
    this.patientVisitId = null;
  }
  //this is to close the opd sticker which is a reuseable component and it is used in visit-list....
  AfterPrintAction($event) {
    this.showOpdSticker = $event.showOpdSticker;
    this.showERSticker = false;

  }
  //loads maximum past visit date limit from parameters
  loadMaximumLastVisitDays() {
    let maxLimit = this.coreService.Parameters.filter(p => p.ParameterGroupName == "Appointment" && p.ParameterName == "MaximumLastVisitDays");
    if (maxLimit[0]) {
      this.maxLastVisitDays = maxLimit[0].ParameterValue;
    }

    const maxInternalReferralDays = this.coreService.Parameters.find(p => p.ParameterGroupName === "Appointment" && p.ParameterName === "InternalReferralDays");
    if (maxInternalReferralDays) {
      this.maxInternalReferralDays = maxInternalReferralDays.ParameterValue;
    }
  }


  //sud:19Nov'18--for Opd-Generic Sticker.
  MapVisitGenericSticker(selVisInfo): VisitGenericStickerModel {
    let retData = new VisitGenericStickerModel();
    retData.HospitalNo = selVisInfo.Patient.PatientCode;
    retData.PatientFullName = selVisInfo.Patient.ShortName;
    retData.BarCodeNum = selVisInfo.Patient.PatientCode;
    retData.VisitType = selVisInfo.VisitType;
    let dob = selVisInfo.Patient.DateOfBirth;
    let gender: string = selVisInfo.Patient.Gender;
    retData.AgeSex = CommonFunctions.GetFormattedAgeSex(dob, gender);
    retData.DoctorName = selVisInfo.ProviderName;
    return retData;
  }

  //sud:19-Nov-18--close generic sticker popup--<event handler>
  CloseGenericSticker() {
    this.showGenericSticker = false;
  }

  FreeReferralPopupOnClose($event) {

    if ($event.action == "free-referral") {
      //unshift adds to the top of the array.

      let newRefVis = $event.data;
      let parentVisId = newRefVis.ParentVisitId;
      let parVisObj = this.visits.find(v => v.PatientVisitId == parentVisId);
      if (parVisObj) {
        parVisObj.IsVisitContinued = true;
      }

      this.visits.unshift($event.data);
      //returns fresh copy of the array, inorder to notify angular some change is made in the array.
      this.visits = this.visits.slice();
      this.changeDetector.detectChanges();
    }

    this.showReferralPopup = false;

  }

  FollowupPopupOnClose($event) {
    this.showFollowupPage = false;

    if ($event.action == "free-followup") {
      //unshift adds to the top of the array.

      let newFolVisit = $event.data;
      let parentVisId = newFolVisit.ParentVisitId;
      let parVisObj = this.visits.find(v => v.PatientVisitId == parentVisId);
      if (parVisObj) {
        parVisObj.IsVisitContinued = true;
      }

      this.showOpdSticker = false;
      this.changeDetector.detectChanges();
      this.selectedVisit = this.visitService.CreateNewGlobal();
      this.selectedVisit.PatientVisitId = newFolVisit.PatientVisitId;
      this.selectedVisit.QueueNo = newFolVisit.QueueNo;

      this.selectedVisit.PatientId = newFolVisit.PatientId;
      if (newFolVisit.BillingTransaction) {
        this.bil_InvoiceNo = newFolVisit.BillingTransaction.InvoiceNo;
        this.bil_FiscalYrId = newFolVisit.BillingTransaction.FiscalYearId;
        this.bil_BilTxnId = newFolVisit.BillingTransaction.BillingTransactionId;
      }
      this.showOpdSticker = true;
      const visit = this.mapVisitData($event.data);
      this.visits.unshift(visit);
      //returns fresh copy of the array, inorder to notify angular some change is made in the array.
      this.visits = this.visits.slice();
      this.changeDetector.detectChanges();
    }
  }

  hotkeys(event) {
    if (event.keyCode == 27 && this.showERSticker) {
      this.Close_ER_Sticker_Popup();
    } else if (event.keyCode == 27 && this.showOpdSticker) {
      this.Close_OPD_Sticker_Popup();
    }
    else if (event.keyCode == 27 && this.showEchsSticker) {
      this.Close_ECHS_Sticker_Popup();
    }
  }

  mapVisitData(visit: any): any {
    let mappedVisit;
    if (visit) {
      mappedVisit = { ...visit.Patient };
      mappedVisit.AppointmentType = visit.AppointmentType;
      mappedVisit.BillStatus = visit.BillStatus;
      mappedVisit.DepartmentId = visit.DepartmentId;
      mappedVisit.DepartmentName = visit.DepartmentName;
      mappedVisit.ParentVisitId = visit.ParentVisitId;
      mappedVisit.PatientVisitId = visit.PatientVisitId;
      mappedVisit.PerformerId = visit.PerformerId;
      mappedVisit.PerformerName = visit.PerformerName;
      mappedVisit.PriceCategoryId = visit.PriceCategoryId;
      mappedVisit.QueueNo = visit.QueueNo;
      mappedVisit.VisitDate = visit.VisitDate;
      mappedVisit.VisitTime = visit.VisitTime;
      mappedVisit.VisitType = visit.VisitType;
      mappedVisit.CountrySubDivisionName = visit.CountrySubDivisionName;
    }
    return mappedVisit;
  }


}
