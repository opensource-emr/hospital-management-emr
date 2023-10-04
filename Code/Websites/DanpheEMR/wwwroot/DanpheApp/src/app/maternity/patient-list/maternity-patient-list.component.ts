import { ChangeDetectorRef, Component, HostListener } from '@angular/core'
import { RouterOutlet, RouterModule, Router } from '@angular/router';
import { SecurityService } from "../../security/shared/security.service"
import { CoreService } from '../../core/shared/core.service';
import { MessageboxService } from '../../shared/messagebox/messagebox.service';
import { MaternityBLService } from '../shared/maternity.bl.service';
import { MaternityPatientListModel, MaternityPatientVM } from '../shared/maternity.model';
import * as moment from 'moment/moment';
import MaternityGridColumnSettings from '../shared/maternity.grid.settings';
import { GridEmitModel } from '../../shared/danphe-grid/grid-emit.model';
import { PatientInfoVM } from './maternity-patient-add/patient-detailsVM';
import { HttpResponse } from '@angular/common/http';


@Component({
  templateUrl: "./maternity-patient-list.html"
})

// App Component class
export class MaternityPatientListComponent {
  public allMaternityPatient: Array<MaternityPatientListModel> = new Array<MaternityPatientListModel>();
  public matPatToUpdate: MaternityPatientVM = new MaternityPatientVM();
  public selectedPatientForEdit: PatientInfoVM;
  public showPatientAddPopup: boolean = false;
  public getConcludedPat: boolean = false;
  public viewActivePatDetails: boolean = false;
  public fromDate: string = null;
  public toDate: string = null;
  public maternityPatientGridColumns: any;
  public selectedPatient: PatientInfoVM = new PatientInfoVM();

  //view:1, anc:2,register:3,
  public showHideButtonObj = {
    "anc": false,
    "view_active_patient": false,
    "maternity_register": false,
    "upload_files": false,
    "conclude": false,
    "remove": false,
    "view_concluded_patient": false
  };

  public allKeys: Array<string>;
  public tmr: any;

  @HostListener('document:keydown.escape', ['$event']) onKeydownHandler(event: KeyboardEvent) {
    this.allKeys.forEach(k => this.showHideButtonObj[k] = false);
    this.showPatientAddPopup = false;
  }

  constructor(public securityService: SecurityService, public router: Router,
    public coreService: CoreService, public maternityBLService: MaternityBLService,
    public msgBoxServ: MessageboxService,
    public changeDetector: ChangeDetectorRef
  ) {
    this.maternityPatientGridColumns = MaternityGridColumnSettings.MaternityPatientColSettings;
  }

  ngOnInit() {
    this.allKeys = Object.keys(this.showHideButtonObj);
  }

  ngOnDestroy() {
    if (this.tmr) {
      window.clearTimeout(this.tmr);
    }
  }

  public onDateChange($event) {
    this.fromDate = $event.fromDate;
    this.toDate = $event.toDate;
    if ((this.fromDate != null) && (this.toDate != null)) {
      if (moment(this.fromDate).isBefore(this.toDate) || moment(this.fromDate).isSame(this.toDate)) {
        this.GetMaternityPatient();
      } else {
        this.msgBoxServ.showMessage('failed', ['Please enter valid From date and To date']);
      }
    }
  }

  GetMaternityPatient() {
    this.coreService.loading = true;
    this.maternityBLService.GetAllActiveMaternityPatientList(this.getConcludedPat, this.fromDate, this.toDate).subscribe((res) => {
      if (res.Status == 'OK') {
        this.allMaternityPatient = res.Results;
        this.coreService.loading = false;
      }
    }, err => {
      this.coreService.loading = false;
      this.msgBoxServ.showMessage('failed', ['Failed to Load Maternity Patient List']);
    });
  }

  SearchPatientForEdit(keyword: any) {
    return ("/api/Maternity/GetDatForEditSearch?searchText=:dd");
  }

  EditExistingPatientInfo() {
    this.showPatientAddPopup = true;
  }

  patientListFormatter(data: any): string {
    let html = "";
    html += data["ShortName"] + ' [ ' + data['PatientCode'] + ' ]' + ' - ' + data['Age'] + ' - ' + ' ' + data['Gender'];
    return html;
  }

  CallBackFromMaternityAdd(event) {
    if (event.close) {
      this.showPatientAddPopup = false;
      this.GetMaternityPatient();
    }
  }

  Close() {
    this.viewActivePatDetails = false;
    this.allKeys.forEach(k => this.showHideButtonObj[k] = false);
  }

  RemovePatient() {
    this.maternityBLService.DeleteMaternityPatient(this.selectedPatient.MaternityPatientId).subscribe((res) => {
      if (res.Status == 'OK') {
        this.showHideButtonObj.remove = false;
        this.msgBoxServ.showMessage('success', ['Successfully Removed.']);
        this.GetMaternityPatient();
      }
    }, err => {
      this.msgBoxServ.showMessage('failed', ['Failed to Remove this patient. Please try later.']);
    });
  }

  ConcludePatient() {
    this.maternityBLService.ConcludeMaternityPatient(this.selectedPatient.MaternityPatientId).subscribe((res) => {
      if (res.Status == 'OK') {
        this.showHideButtonObj.conclude = false;
        this.msgBoxServ.showMessage('success', ['Successfully Concluded.']);
        this.GetMaternityPatient();
      }
    }, err => {
      this.msgBoxServ.showMessage('failed', ['Failed to Remove this patient. Please try later.']);
    });
  }

  MaternityPatientGridActions($event: GridEmitModel) {
    this.selectedPatient = Object.assign({}, $event.Data);
    if (this.tmr) {
      window.clearTimeout(this.tmr);
    }

    if (document.getElementById("maternityPatGridHolder") && document.getElementById("maternityPatGridHolder").getElementsByClassName('ag-center-cols-container')) {
      let htNeeded = document.getElementById("maternityPatGridHolder").getElementsByClassName('ag-center-cols-container')[0].getElementsByClassName("ag-row").length * 35;
      let htmlClassArr = Array.from(document.getElementById("maternityPatGridHolder").getElementsByClassName('ag-center-cols-container') as HTMLCollectionOf<HTMLElement>);
      if (document.getElementById("maternityPatGridHolder").getElementsByClassName("dropdown open") && document.getElementById("maternityPatGridHolder").getElementsByClassName("dropdown open").length) {
        htmlClassArr[0].style.height = (htNeeded + 160 + 'px');
      } else {
        htmlClassArr[0].style.height = (htNeeded + 'px');
      }
    }

    switch ($event.Action) {
      case "anc":
        this.allKeys.forEach(k => this.showHideButtonObj[k] = (k != "anc") ? false : true);
        break;
      case "view_active_patient":
        let data = $event.Data;
        this.matPatToUpdate = null;
        this.matPatToUpdate = Object.assign(new MaternityPatientVM(), data);
        this.allKeys.forEach(k => this.showHideButtonObj[k] = (k != "view_active_patient") ? false : true);
        this.tmr = setTimeout(() => {
          this.matPatToUpdate.ExpectedDeliveryDate = data.ExpectedDeliveryDate;
          this.matPatToUpdate.LastMenstrualPeriod = data.LastMenstrualPeriod;
        }, 300);
        break;
      case "view-concluded-patient":
        let patData = $event.Data;
        this.matPatToUpdate = null;
        this.matPatToUpdate = Object.assign(new MaternityPatientVM(), patData);
        this.allKeys.forEach(k => this.showHideButtonObj[k] = (k != "view_concluded_patient") ? false : true);
        this.tmr = setTimeout(() => {
          this.matPatToUpdate.ExpectedDeliveryDate = patData.ExpectedDeliveryDate;
          this.matPatToUpdate.LastMenstrualPeriod = patData.LastMenstrualPeriod;
        }, 300);
        break;
      case "maternity_register":
        this.selectedPatient = Object.assign(this.selectedPatient, data);
        this.allKeys.forEach(k => this.showHideButtonObj[k] = (k != "maternity_register") ? false : true);
        break;
      case "upload_files":
        this.selectedPatient = Object.assign(this.selectedPatient, data);
        this.allKeys.forEach(k => this.showHideButtonObj[k] = (k != "upload_files") ? false : true);
        break;
      case "conclude":
        this.allKeys.forEach(k => this.showHideButtonObj[k] = (k != "conclude") ? false : true);
        break;
      case "remove":
        this.allKeys.forEach(k => this.showHideButtonObj[k] = (k != "remove") ? false : true);
        break;
      default:
        this.selectedPatient = null;
        break;
    }
  }

  CallBackForClose(event) {
    if (event && event.close) {
      this.allKeys.forEach(k => this.showHideButtonObj[k] = false);
      this.GetMaternityPatient();
    }
  }

}

