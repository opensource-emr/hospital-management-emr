import { Component, EventEmitter, Input, Output } from '@angular/core';
import { DanpheHTTPResponse } from '../../shared/common-models';
import { MessageboxService } from '../../shared/messagebox/messagebox.service';
import { ENUM_DanpheHTTPResponses, ENUM_MessageBox_Status } from '../../shared/shared-enums';
import { EmergencyPatientModel } from '../shared/emergency-patient.model';
import { EmergencyBLService } from '../shared/emergency.bl.service';

@Component({
    selector: 'er-patient-triage',
    templateUrl: './er-triage-actions.html'
})

// App Component class
export class ERTriageActionComponent {
    public loading: boolean = false;

    public ERPatient: EmergencyPatientModel = new EmergencyPatientModel();

    @Output("sendBackERPatientData") sendERPatientData = new EventEmitter<object>();
    @Input("currentPatientToTriage") currentERPatient: EmergencyPatientModel = null;

    constructor(
        private _messageBoxService: MessageboxService,
        private _emergencyBLService: EmergencyBLService,
    ) {
    }

    ngOnInit() {
        this.ERPatient = this.currentERPatient;
    }

    TriagePatient(severity: number): void {
        this.loading = true;

        if (this.loading) {
            if (severity) {
                if (severity === 1) {
                    this.ERPatient.TriageCode = "mild";
                }
                else if (severity === 2) {
                    this.ERPatient.TriageCode = "moderate";
                }
                else if (severity === 3) {
                    this.ERPatient.TriageCode = "critical";
                }
                else if (severity === 4) {
                    this.ERPatient.TriageCode = "death";
                }
                this.PutTriagedCode();
            }
        }
    }

    PutTriagedCode(): void {
        this._emergencyBLService.PutTriageCode(this.ERPatient)
            .subscribe((res: DanpheHTTPResponse) => {
                if (res.Status === ENUM_DanpheHTTPResponses.OK) {
                    this.sendERPatientData.emit({ submit: true });
                    this._messageBoxService.showMessage(ENUM_MessageBox_Status.Success, [this.ERPatient.FullName + ' is successfully triaged [' + this.ERPatient.TriageCode + ']']);
                    this.loading = false;
                } else {
                    this.sendERPatientData.emit({ submit: false });
                    this._messageBoxService.showMessage(ENUM_MessageBox_Status.Failed, ['Cannot be triaged now. Please Try again Later']);
                    this.loading = false;
                }
            });
    }

    Close(): void {
        this.sendERPatientData.emit({ submit: false });
    }
}
