import { ChangeDetectorRef, Component, HostListener } from '@angular/core'
import { Observable } from 'rxjs/Rx';
import { RouterOutlet, RouterModule, Router } from '@angular/router';
import { SecurityService } from "../../security/shared/security.service"
import { CoreService } from '../../core/shared/core.service';
import { MessageboxService } from '../../shared/messagebox/messagebox.service';
import * as moment from 'moment/moment';
import { HttpResponse } from '@angular/common/http';
import VaccinationGridColumnSettings from '../shared/vaccination.grid.settings';
import { VaccinationBLService } from '../shared/vaccination.bl.service';
import { VaccinationPatient } from '../shared/vaccination-patient.model';
import { NepaliDateInGridColumnDetail, NepaliDateInGridParams } from '../../shared/danphe-grid/NepaliColGridSettingsModel';
import { VaccPatientWithVisitInfoVM } from '../shared/vacc-patwithvisit-info-vm';


@Component({
  templateUrl: "./vaccination-patient-list.html",
  host: { '(window:keydown)': 'hotkeys($event)' }
})


export class VaccinationPatientListComponent {

  public showPatientRegistration: boolean;
  public showPatientVaccinationDetail: boolean;
  public vaccinationPatientGridColumns: any;
  public selPatIdForEdit: number = 0;
  public vaccinationPatList: Array<VaccPatientWithVisitInfoVM> = new Array<VaccPatientWithVisitInfoVM>();
  public selectedPatDetail: any;
  public PatientObj: any = null;
  public showVaccSticker: boolean = false;
  public showDob: boolean;
  public immDeptName: string = "";
  public NepaliDateInGridSettings: NepaliDateInGridParams = new NepaliDateInGridParams();
  public selPatientVisitIdForSticker: number = 0;

  constructor(public securityService: SecurityService, public router: Router,
    public coreService: CoreService,
    public msgBoxServ: MessageboxService,
    public changeDetector: ChangeDetectorRef,
    public vaccinationBlService: VaccinationBLService

  ) {
    this.vaccinationPatientGridColumns = VaccinationGridColumnSettings.vaccinationPatientGridColumns;
    this.immDeptName = this.coreService.GetImmunizationDepartmentName().toLowerCase();
    this.NepaliDateInGridSettings.NepaliDateColumnList.push(new NepaliDateInGridColumnDetail('VisitDateTime', false));
  }

  ngOnInit() {
    this.GetAllVaccinationPatient();
  }

  GetAllVaccinationPatient() {
    this.vaccinationPatList = [];
    this.coreService.loading = true;
    this.vaccinationBlService.GetAllVaccinationPatient().subscribe(res => {
      if (res.Status == "OK") {
        this.vaccinationPatList = res.Results;
        if (this.vaccinationPatList && this.vaccinationPatList.length > 0) {
          let todaysDate = moment().format("YYYY-MM-DD");
          this.vaccinationPatList.forEach(vac => {
            //need to add a dynamic propery to the array so that sorting will remain as it is in Grid.
            vac["DaysPassed"] = moment(todaysDate).diff(moment(vac.VisitDateTime, "YYYY-MM-DD"), "days");
          });
        }

        this.coreService.loading = false;
      } else {
        this.msgBoxServ.showMessage("error", [res.ErrorMessage]);
        this.coreService.loading = false;
      }
    });
  }

  ShowPatientRegistation() {
    this.selPatIdForEdit = 0;
    this.showPatientRegistration = true;
  }

  CloseVaccinationRegister($event) {
    this.showPatientRegistration = false;
    this.selPatIdForEdit = 0;

    if ($event && $event.dataAddedUpdated) {
      //Sticker Window Logic after registration
      if (!$event.IsEditMode && $event.PatientVisitId) { // Only showing sticker while first registration not while editing patient data 
        this.selPatientVisitIdForSticker = $event.PatientVisitId;
        this.showVaccSticker = true;
      }
    }
    this.GetAllVaccinationPatient();
  }

  public parentVisitIdForFwup: number = null;

  VaccinationPatientGridActions($event) {
    this.selPatIdForEdit = 0;
    this.showPatientRegistration = false;
    this.showPatientVaccinationDetail = false;
    this.selPatIdForEdit = $event.Data.PatientId;
    this.selectedPatDetail = null;
    switch ($event.Action) {
      case "vaccination":
        this.changeDetector.detectChanges();
        this.selectedPatDetail = $event.Data;
        this.showPatientVaccinationDetail = true;
        break;
      case "edit":
        this.changeDetector.detectChanges();
        this.showPatientRegistration = true;
        break;
      case "sticker":
        this.selPatientVisitIdForSticker = $event.Data.PatientVisitId;
        //this.showDob = $event.Data && $event.Data.DepartmentName && ($event.Data.DepartmentName.toLowerCase() == this.immDeptName);
        this.changeDetector.detectChanges();
        this.showVaccSticker = true;
        break;
      case "followup":
        this.parentVisitIdForFwup = $event.Data.PatientVisitId;
        this.changeDetector.detectChanges();
        this.showFollowupAddPopup = true;
        break;
      default:
        break;
    }
  }

  CloseAllPopUp() {
    //this.GetAllVaccinationPatient();
    this.selPatIdForEdit = 0;
    this.showPatientRegistration = false;
    this.showPatientVaccinationDetail = false;
    this.showVaccSticker = false;
    this.showFollowupAddPopup = false;
    this.PatientObj = "";
    this.parentVisitIdForFwup = null;//reset selvisit-id 
  }


  PatientInfoChanged() {
    if (this.PatientObj && typeof (this.PatientObj) == "object") {
      this.selPatIdForEdit = this.PatientObj.PatientId;
      this.showPatientRegistration = true;
    }
  }

  PatientListFormatter(data: any): string {
    let html: string = "";
    html = "<font size=03>" + "[" + data["PatientCode"] + "]" + "</font>&nbsp;-&nbsp;&nbsp;<font color='blue'; size=03 ><b>" + data["ShortName"] +
      "</b></font>&nbsp;&nbsp;" + "(" + data["Age"] + '/' + data["Gender"] + ")" + '' + "</b></font>";
    return html;
  }

  public AllPatientSearchAsync = (keyword: any): Observable<any[]> => {
    return this.vaccinationBlService.GetBabyPatientList(keyword);
  }

  AfterStickerPrinted($event) {
    this.CloseAllPopUp();
  }

  hotkeys(event) {
    //Esc Key comes here.. 
    if (event.keyCode == 27) {
      this.CloseAllPopUp();
    }

    if (event.altKey) {
      switch (event.keyCode) {
        case 78: {// => ALT+N comes here
          this.ShowPatientRegistation();
          break;
        }
        default:
          break;
      }
    }

  }

  public showFollowupAddPopup: boolean = false;
  CloseFollowupPopup($event) {
    // alert("Followup popup closed");
    //console.log($event);
    this.showFollowupAddPopup = false;
    this.parentVisitIdForFwup = null;//reset selected visit
    if ($event.action == "free-followup") {
      this.selPatientVisitIdForSticker = $event.data.PatientVisitId;
      this.showVaccSticker = true;
    }
    else {
      console.log("Followup Popup closed only");
    }
    this.GetAllVaccinationPatient();//after followup success we need to reload the patient list so that recent followup is seen first..
  }



}

