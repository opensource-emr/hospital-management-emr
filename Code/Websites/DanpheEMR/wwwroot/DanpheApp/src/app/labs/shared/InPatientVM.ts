import { LabReportTemplateModel } from './lab-report-template.model';
//import { LabTestGroup } from './lab-testgroup.model';
import {
    NgForm,
    FormGroup,
    FormControl,
    Validators,
    FormBuilder
} from '@angular/forms';
import * as moment from 'moment/moment';
export class InPatientVM {
    
    public PatientId: number = 0;
    public PatientCode: string = null;
    public AdmittingDoctorId: number = 0;
    public AdmittingDoctorName: string = null;
    public AdmittedDate: string = null;
    public Address: string = null;
    public AdmissionStatus: string = null;    
    public BillStatusOnDischarge: string = null;
    public DateOfBirth: string = null;
    public DischargedDate: string = null;
    public Gender: string = null;  
    public Name: string = null;
    public PatientVisitId: number = 0;
    public PhoneNumber: string = "";
    public VisitCode: string = "";
    public BedInformation: BedInformation = new BedInformation();
}

export class BedInformation {
    public BedCode: string = null;
    public BedFeature: string = null;
    public BedNumber: number = null;
    public BedFeatureId: number = 0;
    public BedId: number = 0;
    public WardId: number = 0;
    public Ward: string = " ";
    public Action: string = null;
    public StartedOn: string = null;
} 
