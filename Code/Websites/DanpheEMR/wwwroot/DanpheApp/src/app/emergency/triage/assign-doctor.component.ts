import { Component, ChangeDetectorRef, EventEmitter, Output, OnInit, Input } from '@angular/core';
import { MessageboxService } from '../../shared/messagebox/messagebox.service';
import { CoreService } from '../../core/shared/core.service';
import { EmergencyPatientModel } from '../shared/emergency-patient.model';
import { CommonFunctions } from '../../shared/common.functions';
import { EmergencyBLService } from '../shared/emergency.bl.service';
import { EmergencyDLService } from '../shared/emergency.dl.service';
import { DanpheHTTPResponse } from '../../shared/common-models';
import { PatientService } from '../../patients/shared/patient.service';
import * as moment from 'moment/moment';

@Component({
    selector: 'assign-doctor',
    templateUrl: './assign-doctor.html'
})

// App Component class
export class ERDoctorAssignComponent {
    public loading: boolean = false;

    public ERPatient: EmergencyPatientModel = new EmergencyPatientModel();
    public doctorSelected: any;

    @Output("sendBackERPatientData") sendERPatientData: EventEmitter<object> = new EventEmitter<object>();
    @Input("currentPatientToAssign") currentERPatient: EmergencyPatientModel = null;
    @Input("allDoctorList") allDoctorList: Array<any> = [];

    constructor(public changeDetector: ChangeDetectorRef,
        public msgBoxServ: MessageboxService, public emergencyBLService: EmergencyBLService,
        public emergencyDLService: EmergencyDLService, public patientService: PatientService,
        public coreService: CoreService) {
        
    }

    ngOnInit() {
        this.ERPatient = this.currentERPatient;
        if (this.ERPatient.ProviderId) {
            this.doctorSelected = this.allDoctorList.find(doc => doc.EmployeeId == this.ERPatient.ProviderId );
        }
    }  

    public PutLamaOfERPatient(actionString: string) {
        this.loading = true;

        if (this.loading) {
            if (this.ERPatient.FinalizedRemarks && this.ERPatient.FinalizedRemarks.trim() != "") {
                this.ERPatient.FinalizedRemarks = this.ERPatient.FinalizedRemarks.trim();
                this.emergencyBLService.PutLamaOfERPatient(this.ERPatient, actionString)
                    .subscribe((res: DanpheHTTPResponse) => {
                        if (res.Status == "OK") {
                            this.sendERPatientData.emit({ submit: true, callBackFrom: 'lama', ERPatient: res.Results });
                            this.msgBoxServ.showMessage("success", ['Doctor Assigned to ' + this.ERPatient.FullName + 'is successfully Updated']);
                            this.loading = false;
                        } else {
                            this.sendERPatientData.emit({ submit: false, ERPatient: null });
                            this.msgBoxServ.showMessage("failed", ['Cannot update AssignTo Doctor. Please Try again Later']);
                            this.loading = false;
                        }
                    });
            }
            else {
                this.msgBoxServ.showMessage("Failed", ["Please write the Medical Advice. "]);
                this.ERPatient.FinalizedRemarks = "";
                this.loading = false;
            }

        }
    }

    AssignedToDocListFormatter(data: any): string {
        return data["FullName"];
    }

    public AssignSelectedDoctor() {
        if (this.doctorSelected && this.doctorSelected.EmployeeId && !(this.ERPatient.ProviderId == this.doctorSelected.EmployeeId)) {
            this.UpdateDoctor();
        }
        else {
            if (this.doctorSelected && this.doctorSelected.EmployeeId) {
                this.msgBoxServ.showMessage("failed", ['Plaese select other doctor this doctor is already currently assigned.']);
            } else {
                this.msgBoxServ.showMessage("failed", ['Plaese select doctor']);
            }
        }
    }

    public UpdateDoctor() {
        this.ERPatient.ProviderId = this.doctorSelected.EmployeeId;
        this.ERPatient.ProviderName = this.doctorSelected.LongSignature;

        if (this.loading) {          
                this.emergencyBLService.UpdateAssignedToDoctor(this.ERPatient)
                    .subscribe((res: DanpheHTTPResponse) => {
                        if (res.Status == "OK") {
                            this.sendERPatientData.emit({ submit: true, ERPatient: res.Results });
                            this.msgBoxServ.showMessage("success", ['Doctor Assigned to ' + this.ERPatient.FullName + 'is successfully Updated']);
                            this.loading = false;
                        } else {
                            this.sendERPatientData.emit({ submit: false, ERPatient: null });
                            this.msgBoxServ.showMessage("failed", ['Cannot update your Medical Advice now. Please Try again Later']);
                            this.loading = false;
                        }
                    });
            }
            else {
                this.msgBoxServ.showMessage("Failed", ["Please write the Medical Advice. "]);
                this.loading = false;
            }

    }

    public Close() {
        this.sendERPatientData.emit({ submit: false, erPatient: null });
    }

   
}