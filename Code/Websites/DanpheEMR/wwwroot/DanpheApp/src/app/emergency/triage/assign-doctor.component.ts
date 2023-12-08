import { Component, EventEmitter, Input, Output } from '@angular/core';
import { DanpheHTTPResponse } from '../../shared/common-models';
import { MessageboxService } from '../../shared/messagebox/messagebox.service';
import { ENUM_DanpheHTTPResponses, ENUM_MessageBox_Status } from '../../shared/shared-enums';
import { EmergencyPatientModel } from '../shared/emergency-patient.model';
import { EmergencyBLService } from '../shared/emergency.bl.service';

@Component({
    selector: 'assign-doctor',
    templateUrl: './assign-doctor.html',
    host: { '(window:keydown)': 'hotkeys($event)' }
})

// App Component class
export class ERDoctorAssignComponent {
    public loading: boolean = false;
    public ERPatient = new EmergencyPatientModel();
    public DoctorSelected: any;
    @Output("sendBackERPatientData") SendERPatientData = new EventEmitter<object>();
    @Input("currentPatientToAssign") CurrentERPatient: EmergencyPatientModel = null;
    @Input("allDoctorList") AllDoctorList: Array<any> = [];

    constructor(
        private _messageBoxService: MessageboxService,
        private _emergencyBLService: EmergencyBLService,
    ) {

    }

    ngOnInit() {
        this.ERPatient = this.CurrentERPatient;
        if (this.ERPatient.PerformerId) {
            this.DoctorSelected = this.AllDoctorList.find(doc => doc.EmployeeId === this.ERPatient.PerformerId);
        }
    }

    PutLamaOfERPatient(actionString: string): void {
        this.loading = true;
        if (this.loading) {
            if (this.ERPatient.FinalizedRemarks && this.ERPatient.FinalizedRemarks.trim() !== "") {
                this.ERPatient.FinalizedRemarks = this.ERPatient.FinalizedRemarks.trim();
                this._emergencyBLService.PutLamaOfERPatient(this.ERPatient, actionString)
                    .subscribe((res: DanpheHTTPResponse) => {
                        if (res.Status === ENUM_DanpheHTTPResponses.OK) {
                            this.SendERPatientData.emit({ submit: true, callBackFrom: 'lama', ERPatient: res.Results });
                            this._messageBoxService.showMessage(ENUM_MessageBox_Status.Success, ['Doctor Assigned to ' + this.ERPatient.FullName + 'is successfully Updated']);
                            this.loading = false;
                        } else {
                            this.SendERPatientData.emit({ submit: false, ERPatient: null });
                            this._messageBoxService.showMessage(ENUM_MessageBox_Status.Failed, ['Cannot update AssignTo Doctor. Please Try again Later']);
                            this.loading = false;
                        }
                    });
            }
            else {
                this._messageBoxService.showMessage(ENUM_MessageBox_Status.Failed, ["Please write the Medical Advice. "]);
                this.ERPatient.FinalizedRemarks = "";
                this.loading = false;
            }
        }
    }

    AssignedToDocListFormatter(data: any): string {
        return data["FullName"];
    }

    AssignSelectedDoctor(): void {
        if (this.DoctorSelected && this.DoctorSelected.EmployeeId && !(this.ERPatient.PerformerId === this.DoctorSelected.EmployeeId)) {
            this.UpdateDoctor();
        }
        else {
            if (this.DoctorSelected && this.DoctorSelected.EmployeeId) {
                this._messageBoxService.showMessage(ENUM_MessageBox_Status.Failed, ['Please select other doctor this doctor is already currently assigned.']);
            } else {
                this._messageBoxService.showMessage(ENUM_MessageBox_Status.Failed, ['Please select doctor']);
            }
        }
    }

    UpdateDoctor(): void {
        this.ERPatient.PerformerId = this.DoctorSelected.EmployeeId;
        this.ERPatient.PerformerName = this.DoctorSelected.LongSignature;
        if (this.loading) {
            this._emergencyBLService.UpdateAssignedToDoctor(this.ERPatient)
                .subscribe((res: DanpheHTTPResponse) => {
                    if (res.Status === ENUM_DanpheHTTPResponses.OK) {
                        this.SendERPatientData.emit({ submit: true, ERPatient: res.Results });
                        this._messageBoxService.showMessage(ENUM_MessageBox_Status.Success, ['Doctor Assigned to ' + this.ERPatient.FullName + 'is successfully Updated']);
                        this.loading = false;
                    } else {
                        this.SendERPatientData.emit({ submit: false, ERPatient: null });
                        this._messageBoxService.showMessage(ENUM_MessageBox_Status.Failed, ['Cannot update your Medical Advice now. Please Try again Later']);
                        this.loading = false;
                    }
                });
        }
        else {
            this._messageBoxService.showMessage(ENUM_MessageBox_Status.Failed, ["Please write the Medical Advice. "]);
            this.loading = false;
        }
    }

    CloseAssignDoctorPopUp(): void {
        this.SendERPatientData.emit({ submit: false, erPatient: null });
    }

    hotkeys(event): void {
        if (event.keyCode === 27) {
            this.CloseAssignDoctorPopUp();
        }
    }

}