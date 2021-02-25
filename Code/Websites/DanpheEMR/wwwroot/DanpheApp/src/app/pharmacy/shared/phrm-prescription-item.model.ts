
import {
  NgForm,
  FormGroup,
  FormControl,
  Validators,
  FormBuilder
} from '@angular/forms'
import * as moment from 'moment/moment';
import { PHRMItemMasterModel } from "./phrm-item-master.model";
import { ICD10 } from '../../clinical/shared/icd10.model';
export class PHRMPrescriptionItem {
  public PrescriptionItemId: number = 0;
  public PatientId: number = null;
  public PatientCode: string = null;
  public PatientName: string = null;
  public PatientFullName: string = null;
  public IsOutdoorPat: boolean = true;
  public ProviderId: number = null;
  //public PrescriptionId: number = 0;
  //public CompanyId: number = null;
  public ItemId: number = null;
  //this is not mapped to server model: needs revision: sud-6feb18
  public ItemName: string = null;
  //public UOMId: number = null;
  // public ItemTypeName: string = null;
  public Quantity: number = 0;
  public Frequency: number = 0;
  public StartingDate: string = "";
  public HowManyDays: number = 0;
  public Notes: string = null;
  public CreatedBy: number = null;
  public CreatedOn: string = "";
  public ItemListByItemType: any = [];
  //4 temporary properties for mangage frequency of medicine
  public mrng: boolean = true;
  public noon: boolean = true;
  public evng: boolean = true;
  public night: boolean = true;
  //below property only for validation check purpose
  public IsWrongItem: boolean = false;
  ////to make the instance ItemMaster with new row
  public SelectedItem: PHRMItemMasterModel = null;

  public PHRMPrescriptionItemsValidator: FormGroup = null;

  public IsSelected: boolean = false;
  public OrderStatus: string = null;
  public IsPreference: boolean = false;
  public IsAvailable: boolean = false;
  public Route: string = null;

  public Dosage: string = null;// sud-6Jul'18
  public GenericId: number = null;// sud-6Jul'18
  public GenericName: string = null;//only for client side.: sud-6Jul'18
  public ItemListByGeneric: Array<any> = [];//only for client side: sud-6Jul'18

  //Added by Anish While making Diagnosis
  public DiagnosisId: number = 0;


  constructor() {
    this.ItemListByItemType = [];
    var _formBuilder = new FormBuilder();
    this.PHRMPrescriptionItemsValidator = _formBuilder.group({
      'ItemId': ['', Validators.required],
      //'ItemTypeName': ['', Validators.required],
      'Quantity': ['', Validators.required],
      'Notes': ['', Validators.required],
      'StartingDate': ['', Validators.compose([Validators.required, this.dateValidator])],
    });
  }
  //Check is dirt or not control
  public IsDirty(fieldname): boolean {
    if (fieldname == undefined) {
      return this.PHRMPrescriptionItemsValidator.dirty;
    }
    else {
      return this.PHRMPrescriptionItemsValidator.controls[fieldname].dirty;
    }
  }
  //Check Is valid or not control
  public IsValid(): boolean { if (this.PHRMPrescriptionItemsValidator.valid) { return true; } else { return false; } }
  public IsValidCheck(fieldname, validator): boolean {
    if (this.PHRMPrescriptionItemsValidator.valid) {
      return true;
    }

    if (fieldname == undefined) {
      return this.PHRMPrescriptionItemsValidator.valid;
    }
    else {

      return !(this.PHRMPrescriptionItemsValidator.hasError(validator, fieldname));
    }
  }
  dateValidator(control: FormControl): { [key: string]: boolean } {

    //get current date, month and time
    var currDate = moment().format('YYYY-MM-DD');
    //if positive then selected date is of future else it of the past || selected year can't be of future
    if (control.value) {
      if ((moment(control.value).diff(currDate) < 0)
        || (moment(control.value).diff(currDate, 'years') > 10)) //can make appointent upto 10 year from today only.
        return { 'wrongDate': true };
    }
    else
      return { 'wrongDate': true };
  }
}
