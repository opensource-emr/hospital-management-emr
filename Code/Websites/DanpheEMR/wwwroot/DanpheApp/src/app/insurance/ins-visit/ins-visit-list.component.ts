import { ChangeDetectorRef, Component } from '@angular/core';
import { VisitGenericStickerModel } from '../../shared/visit-generic-stickers/visit-generic-sticker.model';
import { Visit } from '../../appointments/shared/visit.model';
import { MessageboxService } from '../../shared/messagebox/messagebox.service';
import { SecurityService } from '../../security/shared/security.service';
import { CoreService } from '../../core/shared/core.service';
import { SearchService } from '../../shared/search.service';
import { Router } from '@angular/router';
import { CallbackService } from '../../shared/callback.service';
import { InsuranceBlService } from '../shared/insurance.bl.service';
import { InsuranceService } from '../shared/ins-service';
import { CommonFunctions } from '../../shared/common.functions';
import { GridEmitModel } from '../../shared/danphe-grid/grid-emit.model';
import { INSGridColumnSettings } from '../shared/insurance-grid-columns';
import * as moment from 'moment';
import { VisitService } from '../../appointments/shared/visit.service';
import { PatientService } from '../../patients/shared/patient.service';

@Component({
  templateUrl: "./ins-visit-list.component.html",
  host: { '(window:keydown)': 'hotkeys($event)' }
})

export class INSVisitListComponent {

  insVisits: Array<Visit> = new Array<Visit>();
  insVisitGridColumns: Array<any> = null;
  
  public showFollowupPage: boolean = false;
  public showOpdSticker: boolean = false;
  public selectedVisit: Visit = new Visit();
  public selectedIndex: number = null;
  public maxLastVisitDays: number = null;
  public currentCounter: number = null;
  public showERSticker: boolean = false;
  public showGenericSticker: boolean = false;
  public patVisitGenericStickerInfo: VisitGenericStickerModel = new VisitGenericStickerModel();
  public showReferralPopup: boolean = false;
  public patGirdDataApi: string = "";
  public patientVisitId: number;
  public status: string = "";
  searchText: string = '';
  public enableServerSideSearch: boolean = false;
  constructor(    
    public insuranceService: InsuranceService,
    public insuranceBlService: InsuranceBlService,
    public callbackService: CallbackService,
    public changeDetector: ChangeDetectorRef,
    public router: Router,
    public msgBoxServ: MessageboxService,
    public securityService: SecurityService,
    public coreService: CoreService,
    public visitService:VisitService,
    public patientService:PatientService,
    public _searchService: SearchService) {

    this.currentCounter = this.securityService.getLoggedInCounter().CounterId;

    if (this.currentCounter < 1) {
      this.callbackService.CallbackRoute = '/Insurance/Visit'
      this.router.navigate(['/Billing/CounterActivate']);
    }
    else {
      this.status = "initiated";
      this.loadMaximumLastVisitDays(); 
      this.getParamter();
      this.LoadVisitList("");
      this.insVisitGridColumns = (new INSGridColumnSettings(this.coreService)).InsuranceVisitList;      
      this._searchService.status = this.status;
      this._searchService.maxdayslimit = this.maxLastVisitDays;
    }

  }


  ngAfterViewInit() {
    
  }
  //loads maximum past visit date limit from parameters
  loadMaximumLastVisitDays() {
    let maxLimit = this.coreService.Parameters.filter(p => p.ParameterGroupName == "Insurance" && p.ParameterName == "FollowupValidDays");
    if (maxLimit[0]) {
      this.maxLastVisitDays = maxLimit[0].ParameterValue;
    }
  }

  serverSearchTxt(searchTxt) {
    this.searchText = searchTxt;
    this.LoadVisitList(this.searchText);
  }
  getParamter() {
    let parameterData = this.coreService.Parameters.find(p => p.ParameterGroupName == "Common" && p.ParameterName == "ServerSideSearchComponent").ParameterValue;
    var data = JSON.parse(parameterData);
    this.enableServerSideSearch = data["InsuranceVisitList"];
  }
  //today's all visit or all visits with IsVisitContinued status as false
  LoadVisitList(searchTxt): void {
    this.insuranceBlService.GetInsPatientVisits(this.maxLastVisitDays, searchTxt)
      .subscribe(res => {
        if (res.Status == "OK") {
          this.insVisits = res.Results;
        }
        else {
          this.msgBoxServ.showMessage("failed", [res.ErrorMessage]);

        }
      });
  }
 
  CheckCounterActivete() {

  }

  InsVisitGridActions($event: GridEmitModel) {
    switch ($event.Action) {      
      case "followup":
        {
          var selectedVisit = Object.create($event.Data);
          let todaysdate = moment().format('YYYY-MM-DD');
          let visitdate = moment($event.Data.VisitDate).format('YYYY-MM-DD');          

          if (moment().diff(moment(visitdate), 'days') > this.maxLastVisitDays &&selectedVisit.VisitType == "OPD" ) {            

            let goToPaidFollowup = window.confirm("Free followup days has passed. This will be a paid appointment.");
            if (goToPaidFollowup) {
              this.visitService.appointmentType = "New";
              let selPat = selectedVisit.Patient;
              let pat = this.patientService.getGlobal();
              Object.keys(selPat).forEach(property => {
                if (property in pat) {
                  pat[property] = selPat[property];
                }
              });

              pat.DateOfBirth = moment(pat.DateOfBirth).format('YYYY-MM-DD');
              this.router.navigate(["/Insurance/Visit"]);

            }

          }
          else {
            //only today's or past visit can be followed up, future visit cannot be followed up.
            //we can improve followup logic by allowing followup for only those visits that has visit status as final.
            //all visits has status as inititated for now so using this logic.
            if ((moment(visitdate).diff(todaysdate)) < 0) {             
              this.selectedIndex = $event.RowIndex;
              this.selectedVisit = selectedVisit;              
              let isPaidFollowupEnabled = false;
              let paidFollUpParam = this.coreService.Parameters.find(p => p.ParameterGroupName == "Appointment" && p.ParameterName == "EnablePaidFollowup");
              if (paidFollUpParam) {
                isPaidFollowupEnabled = paidFollUpParam.ParameterValue == "true" ? true : false;                
              }
              this.showFollowupPage = false;
              this.changeDetector.detectChanges();
              this.showFollowupPage = true;              
            }
            else {
              this.msgBoxServ.showMessage("failed", ["Only past visit can be followed up."]);
            }

          }


          break;
        }
      case "printsticker":
        {
          this.showGenericSticker = false;
          var selectedVisit = Object.create($event.Data);
          // if (selectedVisit.VisitType == "emergency") {
          //   this.showERSticker = false;
          //   this.patientVisitId = null;
          //   this.changeDetector.detectChanges();
          //   this.patientVisitId = selectedVisit.PatientVisitId;
          //   this.showERSticker = true;
          // }
          // else {          
            this.showOpdSticker = false;
            this.changeDetector.detectChanges();
            this.selectedVisit = this.insuranceService.CreateNewGlobal();
            this.selectedVisit.PatientVisitId = selectedVisit.PatientVisitId;
            this.selectedVisit.QueueNo = selectedVisit.QueueNo;
            this.selectedVisit.PatientId = selectedVisit.PatientId;
            this.showOpdSticker = true;            
          // }


        }
        break;
      case "generic-sticker":
        {
          // this.patVisitGenericStickerInfo = this.MapVisitGenericSticker($event.Data);
          // this.showGenericSticker = false;
          // this.changeDetector.detectChanges();
          // this.showGenericSticker = true;

        }
        break;

      default:
        break;
    }
  }
  // AssignPatientToGlobal(_patient) {
  //   var patient = this.patientService.CreateNewGlobal();
  //   Object.keys(_patient).forEach(property => {
  //     if (property in patient) {
  //       patient[property] = _patient[property];
  //     }
  //   });

  // }
  
  // CallBackContinueVisit($event) {
  //   //unshift adds to the top of the array.
  //   this.visits[this.selectedIndex].IsVisitContinued = true;
  //   this.visits.unshift($event.visit);
  //   //returns fresh copy of the array, inorder to notify angular some change is made in the array.
  //   this.visits = this.visits.slice();
  //   this.changeDetector.detectChanges();
  // }

  // //this is to close the opd sticker which is a reuseable component and it is used in visit-list.......
  Close_OPD_Sticker_Popup() {
    this.showOpdSticker = false;
  }

  // Close_ER_Sticker_Popup() {
  //   this.showERSticker = false;
  //   this.patientVisitId = null;
  // }
  // //this is to close the opd sticker which is a reuseable component and it is used in visit-list....
  // AfterPrintAction($event) {
  //   this.showOpdSticker = $event.showOpdSticker;
  //   this.showERSticker = false;
  // }

  CloseStickerPrintPopup(){
    this.showOpdSticker = false;
    this.showERSticker = false;
  }

  

  FollowupPopupOnClose($event) {
    this.showFollowupPage = false;

    if ($event.action == "free-followup") {
      //unshift adds to the top of the array.

      let newFolVisit = $event.data;
      let parentVisId = newFolVisit.ParentVisitId;
      let parVisObj = this.insVisits.find(v => v.PatientVisitId == parentVisId);
      if (parVisObj) {
        parVisObj.IsVisitContinued = true;
      }

      this.showOpdSticker = false;
      this.changeDetector.detectChanges();
      this.selectedVisit = this.visitService.CreateNewGlobal();
      this.selectedVisit.PatientVisitId = newFolVisit.PatientVisitId;
      this.selectedVisit.QueueNo = newFolVisit.QueueNo;

      this.selectedVisit.PatientId = newFolVisit.PatientId;
      this.showOpdSticker = true;
      this.insVisits.unshift($event.data);
      //returns fresh copy of the array, inorder to notify angular some change is made in the array.
      this.insVisits = this.insVisits.slice();
      this.changeDetector.detectChanges();
    }

  }

  hotkeys(event) {
    if (event.keyCode == 27) {
      this.CloseStickerPrintPopup();
    }
  }
}


