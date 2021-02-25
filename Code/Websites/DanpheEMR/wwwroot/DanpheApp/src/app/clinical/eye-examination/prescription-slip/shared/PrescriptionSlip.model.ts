import {
  NgForm,
  FormGroup,
  FormControl,
  Validators,
  FormBuilder,
  ReactiveFormsModule
} from '@angular/forms';
import * as moment from 'moment/moment';
import { HistoryModel } from './history.model';
import { PlupModel } from './plup.model';
import { VaUnaidedModel } from './va-unaided.model';
import { RetinoscopyModel } from './retinoscopy.model';
import { AcceptanceModel } from './acceptance.model';
import { SchrimeModel } from './schrime.model';
import { TBUTModel } from './TBUT.model';
import { DilateModel } from './dilate.model';
import { IOPModel } from './IOP.model';
import { FinalClassModel } from './FinalClass.model';
import { AdviceDiagnosisModel } from './advicediagnosis.model';

export class PrescriptionSlipModel {

  public SNo: number = 0;
  public VisitId: number = 0;
  public PatientId: number = 0;
  public ProviderId: number = 0;
  public MasterId: number = 0;
  public VisitDate: Date = new Date();
  public ModifiedOn: Date = new Date();
  public CreatedBy: number = 0;
  public CreatedOn: Date = new Date();


  public History: HistoryModel = new HistoryModel();
  public Plup: PlupModel = new PlupModel();
  public Retinoscopy: RetinoscopyModel = new RetinoscopyModel();
  public Acceptance: AcceptanceModel = new AcceptanceModel();
  public Dilate: DilateModel = new DilateModel();
  public IOP: IOPModel = new IOPModel();
  public Schrime: SchrimeModel = new SchrimeModel();
  public TBUT: TBUTModel = new TBUTModel();
  public VaUnaided: VaUnaidedModel = new VaUnaidedModel();
  public FinalClass: FinalClassModel = new FinalClassModel();
  public AdviceDiagnosis: AdviceDiagnosisModel = new AdviceDiagnosisModel();

  constructor() {
  }



}
