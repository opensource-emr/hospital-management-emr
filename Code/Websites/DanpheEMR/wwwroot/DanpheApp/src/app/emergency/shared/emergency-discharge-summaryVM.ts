import {
    NgForm,
    FormGroup,
    FormControl,
    Validators,
    FormBuilder
} from '@angular/forms';
import { EmergencyPatientModel } from './emergency-patient.model';
import { Vitals } from '../../clinical/shared/vitals.model';
import { EmergencyDischargeSummary } from './emergency-discharge-summary.model';

export class EmergencyDischargeSummaryVM {
    public EmergencyPatient: EmergencyPatientModel = new EmergencyPatientModel();
    public Vitals: Vitals = new Vitals();
    public DischargeSummary: EmergencyDischargeSummary = new EmergencyDischargeSummary();

    public VisitCode: string = null;

    public LabOrders: Array<string> = [];
    public ImagingOrders: Array<string> = [];
}

