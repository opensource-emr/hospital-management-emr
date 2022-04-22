import { Component, ChangeDetectorRef } from '@angular/core'
import { Router } from '@angular/router';
import { Visit } from "../shared/visit.model";
import { VisitBLService } from '../shared/visit.bl.service';
import { VisitService } from '../shared/visit.service';
import { PatientService } from "../../patients/shared/patient.service";
//needed only to clear previously selected appointment when navigating within Appointment Module
import { AppointmentService } from '../shared/appointment.service';
import GridColumnSettings from '../../shared/danphe-grid/grid-column-settings.constant';
import { GridEmitModel } from "../../shared/danphe-grid/grid-emit.model";
import * as moment from 'moment/moment';
import { MessageboxService } from '../../shared/messagebox/messagebox.service';
import { CoreService } from '../../core/shared/core.service';
import { SecurityService } from '../../security/shared/security.service';
import { CallbackService } from '../../shared/callback.service';
import { VisitGenericStickerModel } from '../../shared/visit-generic-stickers/visit-generic-sticker.model';
import { CommonFunctions } from '../../shared/common.functions';
import { APIsByType, SearchService } from '../../shared/search.service';

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
      this.callbackService.CallbackRoute = '/Appointment/ListVisit'
      this.router.navigate(['/Billing/CounterActivate']);
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

  serverSearchTxt(searchTxt) {
    this.searchText = searchTxt;
    this.LoadVisitList(this.searchText);
  }
  getParamter() {
    let parameterData = this.coreService.Parameters.find(p => p.ParameterGroupName == "Common" && p.ParameterName == "ServerSideSearchComponent").ParameterValue;
    var data = JSON.parse(parameterData);
    this.enableServerSideSearch = data["VisitList"];
  }
  //today's all visit or all visits with IsVisitContinued status as false
  LoadVisitList(searchTxt): void {
    this.visitBlService.GetVisits(this.maxLastVisitDays, searchTxt)
      .subscribe(res => {
        if (res.Status == "OK") {
          this.visits = res.Results;
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
      //sud:03May'21--commented transfer case since it's not required after Credit Note implemented.
      //we'll revise the requirement later to give some easier solution to change the doctor/department..
      
      // case "transfer":
      //   {
      //     //cloning the object inorder to change the transfer from original object, to avoid changing the original object.
      //     var selectedVisit = Object.create($event.Data);
      //     let todaysdate = moment().format('YYYY-MM-DD');
      //     let visitdate = moment($event.Data.VisitDate).format('YYYY-MM-DD');

      //     //if the provider transfers another provider in followup then it should be treated as another visit.

      //     //Ashim:31stOct2017- Commented the below condition as the requirement was changed.
      //     //New Req: Transfer can be done in case of followup as well and the time limit changed from 1 day to 15 days.
      //     //if (selectedVisit.AppointmentType == "followup") {
      //     //    this.msgBoxServ.showMessage("failed", ["Cannot Transfer from followup visit, please create a new visit instead."]);
      //     //}
      //     //else {
      //     //only today's visit can be transfered
      //     //Ashim:31stOct2017- Modified the below condition as the requirement was changed.
      //     //New Req: only today's or past visit can be transfered, future visit cannot be transfered.
      //     if ((moment(visitdate).diff(todaysdate)) <= 0) {

      //       this.selectedVisit = selectedVisit;
      //       this.visitService.appointmentType = "Transfer";
      //       //sud:26June'19--needed to assign parent's visit info in current one.
      //       this.visitService.ParentVisitInfo = selectedVisit;//IMPORTANT..! It's used extensively throughout visit module, Don't Remove It.
      //       this.AssignPatientToGlobal($event.Data.Patient);
      //       this.router.navigate(['/Appointment/Visit']);
      //     }
      //     else {
      //       this.msgBoxServ.showMessage("failed", ["Only past or today's visit can be transfered to another doctor."]);
      //     }
      //     break;

      //   }
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
            let refChargeParam = this.coreService.Parameters.find(p => p.ParameterGroupName == "Billing" && p.ParameterName == "ReferralChargeApplicable");
            if (refChargeParam) {
              isRefChargeApplicable = refChargeParam.ParameterValue == "true" ? true : false;
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
              this.selectedVisit = selectedVisit;

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

          var selectedVisit = Object.create($event.Data);
          if (selectedVisit.VisitType == "emergency") {
            this.showERSticker = false;
            this.patientVisitId = null;
            this.changeDetector.detectChanges();
            this.patientVisitId = selectedVisit.PatientVisitId;
            this.showERSticker = true;
          }
          else {
            //this.selectedVisit = selectedVisit;
            this.showOpdSticker = false;
            this.changeDetector.detectChanges();
            this.selectedVisit = this.visitService.CreateNewGlobal();
            this.selectedVisit.PatientVisitId = selectedVisit.PatientVisitId;
            this.selectedVisit.QueueNo = selectedVisit.QueueNo;

            this.selectedVisit.PatientId = selectedVisit.PatientId;
            this.showOpdSticker = true;
            //this.router.navigate(['/Appointment/PrintSticker']);
          }


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
      if(newFolVisit.BillingTransaction){
        this.bil_InvoiceNo = newFolVisit.BillingTransaction.InvoiceNo;
        this.bil_FiscalYrId = newFolVisit.BillingTransaction.FiscalYearId;
        this.bil_BilTxnId = newFolVisit.BillingTransaction.BillingTransactionId;
      }
      this.showOpdSticker = true;
      this.visits.unshift($event.data);
      //returns fresh copy of the array, inorder to notify angular some change is made in the array.
      this.visits[0].CountryId = newFolVisit.Patient.CountryId;
      this.visits[0].CountrySubDivisionId = newFolVisit.Patient.CountrySubDivisionId;
      this.visits = this.visits.slice();
      this.changeDetector.detectChanges();
    }



  }

  hotkeys(event) {
    if (event.keyCode == 27 && this.showERSticker) {
      this.Close_ER_Sticker_Popup();
    }else if(event.keyCode == 27 && this.showOpdSticker){
      this.Close_OPD_Sticker_Popup();
    }
  }


}
