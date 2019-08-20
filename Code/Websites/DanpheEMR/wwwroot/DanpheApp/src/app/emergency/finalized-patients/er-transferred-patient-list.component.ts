import { Component, ChangeDetectorRef } from '@angular/core';
import { MessageboxService } from '../../shared/messagebox/messagebox.service';
import { CoreService } from '../../core/shared/core.service';
import { EmergencyPatientModel } from '../shared/emergency-patient.model';
import EmergencyGridColumnSettings from '../shared/emergency-gridcol-settings';
import { GridEmitModel } from '../../shared/danphe-grid/grid-emit.model';
import { EmergencyBLService } from '../shared/emergency.bl.service';
import { Patient } from '../../patients/shared/patient.model';
import { SelectedPatForDischargeModel } from '../shared/selectedDischarge.model';
import { PatientService } from '../../patients/shared/patient.service';
import { VisitService } from '../../appointments/shared/visit.service';


@Component({
    templateUrl: './er-transferred-patient-list.html'
})

// App Component class
export class ERTransferredPatientListComponent {   
    public showERPatRegistration: boolean = false;
    public showOrderPopUp: boolean = false;
    public showSummaryView: boolean = false;
    public showSummaryAdd: boolean = false;
    public showAddVitals: boolean = false;

    public showVitalsList: boolean = true;

    public visitId: number = null;
    public patientId: number = null;
    public showGridList: boolean = true;

    public loading: boolean = false;

    public selectedERPatientToEdit: EmergencyPatientModel = new EmergencyPatientModel();
    public selectedEmergencyPatient: EmergencyPatientModel = new EmergencyPatientModel();
    public selectedDischarge: SelectedPatForDischargeModel = new SelectedPatForDischargeModel();

    public allTransferredPatients: Array<EmergencyPatientModel> = new Array<EmergencyPatientModel>();

    public ERTransferredPatientGridCol: Array<any> = null;
 
    

    constructor(public changeDetector: ChangeDetectorRef, public msgBoxServ: MessageboxService, public patientServ: PatientService, public visitServ: VisitService,
        public emergencyBLService: EmergencyBLService, public coreService: CoreService) {
        this.ERTransferredPatientGridCol = EmergencyGridColumnSettings.ERTransferredPatientList;
        this.GetERTransferredPatientList();
    }



    public GetERTransferredPatientList() {
        this.emergencyBLService.GetAllTransferredERPatients()
            .subscribe(res => {
                if (res.Status == "OK") {
                    this.allTransferredPatients = res.Results;
                }
                else {
                    this.msgBoxServ.showMessage("Failed", ["Cannot Get Emergency PatientList !!"]);
                }
            });
    }   

    public ParentOfPopUpClicked($event) {
        var currentTarget = $event.currentTarget;
        var target = $event.target;
        if (target == currentTarget) {
            this.CloseAllERPatientPopUp();
        }
    }
    public CloseAllERPatientPopUp() {
        var body = document.getElementsByTagName("body")[0];
        body.style.overflow = "inherit";
        this.changeDetector.detectChanges();
        //Resets Order PopUp
        this.selectedEmergencyPatient = new EmergencyPatientModel();
        this.selectedERPatientToEdit = new EmergencyPatientModel();
        this.showOrderPopUp = false;
        this.showERPatRegistration = false;
        this.showSummaryView = false;
        this.showSummaryAdd = false;
        this.showAddVitals = false;
    }

    //Called each time just before any PopUp Opens
    public ResetAllAndHideParentBodyScroll() {
        this.showERPatRegistration = false;
        this.showOrderPopUp = false;
        this.showSummaryView = false;
        this.showSummaryAdd = false;
        var body = document.getElementsByTagName("body")[0];
        body.style.overflow = "hidden";
    }   

    EditAction(event: GridEmitModel) {
        switch (event.Action) {
            case "edit": {
                this.selectedERPatientToEdit = new EmergencyPatientModel();
                this.showERPatRegistration = false;
                this.changeDetector.detectChanges();
                this.selectedERPatientToEdit = Object.assign(this.selectedERPatientToEdit, event.Data);
                this.showERPatRegistration = true;
            }
                break;
            case "order": {
                this.ResetAllAndHideParentBodyScroll();
                this.selectedEmergencyPatient = new EmergencyPatientModel();
                this.changeDetector.detectChanges();
                this.selectedEmergencyPatient = Object.assign(this.selectedEmergencyPatient, event.Data);
                this.showOrderPopUp = true;
            }
                break;
            case "add-vitals": {
                this.ResetAllAndHideParentBodyScroll();
                this.selectedEmergencyPatient = new EmergencyPatientModel();
                this.changeDetector.detectChanges();
                this.selectedEmergencyPatient = Object.assign(this.selectedEmergencyPatient, event.Data);
                this.visitId = this.selectedEmergencyPatient.PatientVisitId;
                this.showAddVitals = true;
            }
                break;
            case "dischargesummary": {
                this.CloseAllERPatientPopUp();
                this.visitId = event.Data.PatientVisitId;
                this.patientId = event.Data.PatientId;
                this.showGridList = false;
            }
                break;
            default:
                break;
        }
    }

    Back() {
        this.ResetAllAndHideParentBodyScroll();
        this.CloseAllERPatientPopUp();
        this.changeDetector.detectChanges();
        this.GetERTransferredPatientList();
        this.showGridList = true;
    }

    CloseSummaryAdd() {
        this.CloseAllERPatientPopUp();
        this.selectedDischarge = new SelectedPatForDischargeModel();
    }

    public ReturnFromOrderAction($event) {
        this.CloseAllERPatientPopUp();
    }

    public ReturnFromPatRegistrationEdit($event) {
        this.CloseAllERPatientPopUp();
        if ($event.submit) {
            let itmIndex = this.allTransferredPatients.findIndex(tst => tst.ERPatientId == $event.ERPatient.ERPatientId);
            if (itmIndex >= 0) {
                this.allTransferredPatients.splice(itmIndex, 1, $event.ERPatient);
                this.allTransferredPatients = this.allTransferredPatients.slice();
            } else {
                this.GetERTransferredPatientList();
            }
        }
    }

}