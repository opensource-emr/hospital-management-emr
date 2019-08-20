import { Component, ChangeDetectorRef } from '@angular/core';
import { MessageboxService } from '../../shared/messagebox/messagebox.service';
import { CoreService } from '../../core/shared/core.service';
import { EmergencyPatientModel } from '../shared/emergency-patient.model';
import EmergencyGridColumnSettings from '../shared/emergency-gridcol-settings';
import { GridEmitModel } from '../../shared/danphe-grid/grid-emit.model';
import { EmergencyBLService } from '../shared/emergency.bl.service';
import { Patient } from '../../patients/shared/patient.model';


@Component({
    templateUrl: './er-finalized-patients.html'
})

// App Component class
export class ERFinalizedComponent {
    constructor(public changeDetector: ChangeDetectorRef, public msgBoxServ: MessageboxService,
        public emergencyBLService: EmergencyBLService, public coreService: CoreService) {
    }
    
}