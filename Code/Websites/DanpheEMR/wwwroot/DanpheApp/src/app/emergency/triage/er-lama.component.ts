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
    selector: 'er-patient-lama',
    templateUrl: './er-lama.html'
})

// App Component class
export class ERLamaComponent {
    public loading: boolean = false;

    public ERPatient: EmergencyPatientModel = new EmergencyPatientModel();

    @Output("sendBackERPatientLamaData") sendERPatientData: EventEmitter<object> = new EventEmitter<object>();
    @Input("currentPatientToLeave") currentERPatient: EmergencyPatientModel = null;
    @Input("action") action: string = null; 

    constructor(public changeDetector: ChangeDetectorRef,
        public msgBoxServ: MessageboxService, public emergencyBLService: EmergencyBLService,
        public emergencyDLService: EmergencyDLService, public patientService: PatientService,
        public coreService: CoreService) {
    }

    ngOnInit() {
        this.ERPatient = this.currentERPatient;
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
                          this.msgBoxServ.showMessage("success", [this.ERPatient.FullName + 'is successfully' + res.Results.FinalizedStatus]);
                            this.loading = false;
                        } else {
                            this.sendERPatientData.emit({ submit: false, ERPatient: null });
                            this.msgBoxServ.showMessage("failed", ['Cannot update your Medical Request now. Please Try again Later']);
                            this.loading = false;
                        }
                    });
            }
            else
            {
                this.msgBoxServ.showMessage("Failed", ["Please write the Medical Advice. "]);
                this.ERPatient.FinalizedRemarks = "";
                this.loading = false;
            }
           
        }
    }
    

    public Close() {
        this.sendERPatientData.emit({ submit: false, erPatient: null });
    }   
}
