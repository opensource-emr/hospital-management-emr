import { Component, ChangeDetectorRef } from '@angular/core';
import { MessageboxService } from '../../shared/messagebox/messagebox.service';
import { CoreService } from '../../core/shared/core.service';
import { EmergencyPatientModel } from '../shared/emergency-patient.model';
import EmergencyGridColumnSettings from '../shared/emergency-gridcol-settings';
import { GridEmitModel } from '../../shared/danphe-grid/grid-emit.model';
import { EmergencyBLService } from '../shared/emergency.bl.service';
import { Patient } from '../../patients/shared/patient.model';
import { DanpheHTTPResponse } from '../../shared/common-models';


@Component({
    selector: 'triage-patient-list',
    templateUrl: './er-triage-patient-list.html'
})


export class ERTriagePatientListComponent {
    public showOrderPopUp: boolean = false;
    public showlamaPopUp: boolean = false;
    public showERPatRegistration: boolean = false;
    public showAssignDoctor: boolean = false;
    

    public doctorsList: Array<any> = [];
    public TriagedERPatients: Array<EmergencyPatientModel> = new Array<EmergencyPatientModel>();
    public TriagedERPatientGridCol: Array<any> = null;
    public selectedTriagedPatientForOrder: EmergencyPatientModel = new EmergencyPatientModel();
    public selectedPatientForLama: EmergencyPatientModel = new EmergencyPatientModel();
    public selectedERPatientToEdit: EmergencyPatientModel = new EmergencyPatientModel();
    public index: number = 0;
    public action: string = "";

    constructor(public changeDetector: ChangeDetectorRef, public msgBoxServ: MessageboxService,
        public emergencyBLService: EmergencyBLService, public coreService: CoreService) {
        this.TriagedERPatientGridCol = EmergencyGridColumnSettings.TriagedERPatientList;
        this.GetERTriagedPatientList();
        this.GetDoctorsList();
    }


    public GetDoctorsList() {
        this.emergencyBLService.GetDoctorsList()
            .subscribe(res => {
                if (res.Status == 'OK') {
                    if (res.Results.length) {
                        this.doctorsList = res.Results;
                    }
                    else {
                        console.log(res.ErrorMessage);
                    }
                }
            },
                err => {
                    this.msgBoxServ.showMessage('Failed', ["unable to get Doctors list.. check log for more details."]);
                    console.log(err.ErrorMessage);
                });
    }


    public GetERTriagedPatientList() {
        this.emergencyBLService.GetAllTriagedPatients()
            .subscribe((res: DanpheHTTPResponse) => {
                if (res.Status == "OK") {
                    this.TriagedERPatients = res.Results;
                } else {
                    this.msgBoxServ.showMessage("Failed", ["Cannot Get Triaged Patient List !!"]);
                }
            });
    }





    //Closes the Registration PopUp if clicked Outside popup window
    public ParentOfPopUpClicked($event) {
        var currentTarget = $event.currentTarget;
        var target = $event.target;
        if (target == currentTarget) {
            this.CloseAllERPatientPopUp();
        }
    }

    //Called each time just before any PopUp Opens
    public ResetAllAndHideParentBodyScroll() {
        this.showlamaPopUp = false;
        this.showOrderPopUp = false;
        var body = document.getElementsByTagName("body")[0];
        body.style.overflow = "hidden";
    }    

    //Called each time when any of the popUp needs to close or when clicked outside the parent div
    public CloseAllERPatientPopUp() {
        var body = document.getElementsByTagName("body")[0];
        body.style.overflow = "inherit";
        this.changeDetector.detectChanges();
        //Resets Order PopUp
        this.selectedTriagedPatientForOrder = new EmergencyPatientModel();
        this.selectedPatientForLama = new EmergencyPatientModel();
        this.showOrderPopUp = false;
        this.showlamaPopUp = false;
        this.showERPatRegistration = false;
        this.showAssignDoctor = false;
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
            case "admitted": {
                this.ResetAllAndHideParentBodyScroll();
                this.selectedPatientForLama = new EmergencyPatientModel();
                this.changeDetector.detectChanges();
                this.selectedPatientForLama = Object.assign(this.selectedPatientForLama, event.Data);
                this.action = "admitted";
                this.showlamaPopUp = true;
            }
                break;
            case "death": {
                this.ResetAllAndHideParentBodyScroll();
                this.selectedPatientForLama = new EmergencyPatientModel();
                this.changeDetector.detectChanges();
                this.selectedPatientForLama = Object.assign(this.selectedPatientForLama, event.Data);
                this.action = "death";
                this.showlamaPopUp = true;
            }
                break;
            case "transferred": {
                this.ResetAllAndHideParentBodyScroll();
                this.selectedPatientForLama = new EmergencyPatientModel();
                this.changeDetector.detectChanges();
                this.selectedPatientForLama = Object.assign(this.selectedPatientForLama, event.Data);
                this.action = "transferred";
                this.showlamaPopUp = true;
            }
                break;
            case "discharged": {
                this.ResetAllAndHideParentBodyScroll();
                this.selectedPatientForLama = new EmergencyPatientModel();
                this.changeDetector.detectChanges();
                this.selectedPatientForLama = Object.assign(this.selectedPatientForLama, event.Data);
                this.action = "discharged";
                this.showlamaPopUp = true;
            }
                break;

            case "lama": {
                this.ResetAllAndHideParentBodyScroll();
                this.selectedPatientForLama = new EmergencyPatientModel();
                this.changeDetector.detectChanges();
                this.selectedPatientForLama = Object.assign(this.selectedPatientForLama, event.Data);
                this.action = "lama";
                this.showlamaPopUp = true;
            }
                break;
            case "order": {
                this.ResetAllAndHideParentBodyScroll();
                this.selectedTriagedPatientForOrder = new EmergencyPatientModel();
                this.changeDetector.detectChanges();
                this.selectedTriagedPatientForOrder = Object.assign(this.selectedTriagedPatientForOrder, event.Data);
                this.showOrderPopUp = true;
            } 
                break;
            case "show-assign-doctor": {
                this.ResetAllAndHideParentBodyScroll();
                this.selectedTriagedPatientForOrder = new EmergencyPatientModel();
                this.changeDetector.detectChanges();
                this.selectedERPatientToEdit = Object.assign(this.selectedERPatientToEdit, event.Data);
                if (this.doctorsList.length) {
                    this.showAssignDoctor = true;
                } else {
                    this.msgBoxServ.showMessage("Failed", ["Please Try Later"]);
                }
            } 
                break;
            case "undo-triage": {
                this.selectedTriagedPatientForOrder = new EmergencyPatientModel();
                this.changeDetector.detectChanges();
                this.selectedTriagedPatientForOrder = Object.assign(this.selectedTriagedPatientForOrder, event.Data);
                this.UndoTriage(this.selectedTriagedPatientForOrder);
            }
                break;
            default:
                break;
        }
    }

    public UndoTriage(selectedPat: EmergencyPatientModel) {
        var undoTriage = window.confirm("Are You Sure You want to undo this triage ?");
        if (undoTriage) {
            this.emergencyBLService.UndoTriageOfERPatient(selectedPat)
                .subscribe((res: DanpheHTTPResponse) => {
                    if (res.Status == "OK") {
                        let itmIndex = this.TriagedERPatients.findIndex(tst => tst.ERPatientId == selectedPat.ERPatientId);
                        this.TriagedERPatients.splice(itmIndex, 1);
                        this.TriagedERPatients = this.TriagedERPatients.slice();
                    } else {
                        this.msgBoxServ.showMessage("Failed", ["Cannot Undo Triag code of a Patient Now."]);
                    }
                });
        }
    }

    public ReturnFromOrderAndLamaAction($event) {
        this.CloseAllERPatientPopUp();
        if ($event.submit) {
            if ($event.callBackFrom == 'lama') {
                let itmIndex = this.TriagedERPatients.findIndex(tst => tst.ERPatientId == $event.ERPatient.ERPatientId);
                this.TriagedERPatients.splice(itmIndex, 1);
                this.TriagedERPatients = this.TriagedERPatients.slice();
            }
        }
    }

    public ReturnFromPatRegistrationEdit($event) {
        this.CloseAllERPatientPopUp();
        if ($event.submit) {
            let itmIndex = this.TriagedERPatients.findIndex(tst => tst.ERPatientId == $event.ERPatient.ERPatientId);
            if (itmIndex >= 0) {
                this.TriagedERPatients.splice(itmIndex, 1, $event.ERPatient);
                this.TriagedERPatients = this.TriagedERPatients.slice();
            } else {
                this.GetERTriagedPatientList();
            }            
        }
    }

    public ReturnFromAssignDoctor($event) {
        this.CloseAllERPatientPopUp();
        if ($event.submit) {
            let itmIndex = this.TriagedERPatients.findIndex(tst => tst.ERPatientId == $event.ERPatient.ERPatientId);
            if (itmIndex >= 0) {
                this.TriagedERPatients[itmIndex].ProviderName = $event.ERPatient.ProviderName;
                this.TriagedERPatients = this.TriagedERPatients.slice();
            } else {
                this.GetERTriagedPatientList();
            }
        }
    }

}