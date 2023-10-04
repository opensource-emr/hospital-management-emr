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
    selector: 'er-patient-triage',
    templateUrl: './er-triage-actions.html'
})

// App Component class
export class ERTriageActionComponent {
    public loading: boolean = false;

    public ERPatient: EmergencyPatientModel = new EmergencyPatientModel();

    @Output("sendBackERPatientData") sendERPatientData: EventEmitter<object> = new EventEmitter<object>();
    @Input("currentPatientToTriage") currentERPatient: EmergencyPatientModel = null;

    constructor(public changeDetector: ChangeDetectorRef,
        public msgBoxServ: MessageboxService, public emergencyBLService: EmergencyBLService,
        public emergencyDLService: EmergencyDLService, public patientService: PatientService,
        public coreService: CoreService) {
    }

    ngOnInit() {
        this.ERPatient = this.currentERPatient;
    }

    public TriagePatient(severity: number) {
        this.loading = true;

        if (this.loading) {
            if (severity) {
                if (severity == 1) {
                    this.ERPatient.TriageCode = "mild";
                }
                else if (severity == 2) {
                    this.ERPatient.TriageCode = "moderate";
                }
                else if (severity == 3) {
                    this.ERPatient.TriageCode = "critical";
              }
              else if (severity == 4) {
                this.ERPatient.TriageCode = "death";
              }

                this.PutTriagedCode();
            }
        }
    }

    public PutTriagedCode() {
        this.emergencyBLService.PutTriageCode(this.ERPatient)
            .subscribe((res: DanpheHTTPResponse) => {
                if (res.Status == "OK") {
                    this.sendERPatientData.emit({ submit: true });
                    this.msgBoxServ.showMessage("success", [this.ERPatient.FullName + 'is successfully triaged [' + this.ERPatient.TriageCode + ']']);
                    this.loading = false;
                } else {
                    this.sendERPatientData.emit({ submit: false });
                    this.msgBoxServ.showMessage("failed", ['Cannot be triaged now. Please Try again Later']);   
                    this.loading = false;
                }
            });
    }

    public Close() {
        this.sendERPatientData.emit({ submit: false });
    }   
}
