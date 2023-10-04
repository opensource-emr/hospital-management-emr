import { Vitals } from "../../clinical/shared/vitals.model";
import { Patient } from "../../patients/shared/patient.model";


export class DoctorNotes {
    public patVitals: Vitals = new Vitals();
    public patDetail: Patient = new Patient();
    public Date: string = null;
    public History: string = null;
    public Complain: string = null;
    public ProvisionalDiagnosis: string = null;
    public Medication: string = null;
    public Investigation: string = null;
}
