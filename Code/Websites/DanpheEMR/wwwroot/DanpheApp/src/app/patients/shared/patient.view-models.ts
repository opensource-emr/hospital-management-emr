import {
  NgForm,
  FormGroup,
  FormControl,
  Validators,
  FormBuilder
} from '@angular/forms'

import * as moment from 'moment/moment';

import { Visit } from "../../appointments/shared/visit.model";
import { Admission } from '../../adt/shared/admission.model';


export class PatientWithVisitInfoVM {
  public PatientId: number = 0;
  public PatientCode: string = null;
  public ShortName: string = null;
  public FirstName: string = "";
  public MiddleName: string = null;
  public LastName: string = "";
  public PatientNameLocal: string = "";
  public Age: string = null;
  public Gender: string = null;
  public CountryName: string = null;
  public CountryId: number = 0;
  public PhoneNumber: string = "";
  public DateOfBirth: string = null;
  public Address: string = null;
  public PANNumber: string = "";
  public IsOutdoorPat: boolean = null;
  public CreatedOn: string = null;
  public CountrySubDivisionId: number = null;
  //display purpose only
  public CountrySubDivisionName: string = null;

  //Appointment

  public LatestVisits: Array<Visit> = new Array<Visit>();
  public Admissions: Array<Admission> = new Array<Admission>();
  public IsAdmitted: boolean = false;
  public LatestVisitType: string = null;
  public LatestVisitCode: string = null;
  public LatestVisitId: string = null;
  public LatestVisitDate: string = null;
  public MembershipTypeId: number = null;
  public MembershipTypeName: string = null;
  public MembershipDiscountPercent: number = null;
  public DialysisCode: number = null;
  //Insurance
  public  Ins_HasInsurance: boolean=null;
  public Ins_NshiNumber:string=null;
  public Ins_InsuranceBalance : number=0;
  constructor() {
  }

}
