import {
    NgForm,
    FormGroup,
    FormControl,
    Validators,
    FormBuilder,
    ReactiveFormsModule
} from '@angular/forms'
import * as moment from 'moment/moment';
import { DrugsRequistionItemModel } from './drugs-requistion-items.model'
import { PHRMPatient } from "../../pharmacy/shared/phrm-patient.model";
import { Patient } from "../../patients/shared/patient.model";
export class DrugsRequisitonModel {

    public RequisitionId: number = 0;
    public VisitId: number = 0; 
    public PatientId: number = 0;
    public ReferenceId: string = null;
    public CreatedBy: number = 0;
    public CreateOn: string = "";

    public ItemName:string="";
    public RequisitionItems: Array<DrugsRequistionItemModel> = new Array<DrugsRequistionItemModel>();

     //only for read purpose
    public selectedPatient:PHRMPatient = new PHRMPatient();
    //public selectedPatient: Patient = new Patient();
    //only for show in list
    public PatientName: string = "";

}