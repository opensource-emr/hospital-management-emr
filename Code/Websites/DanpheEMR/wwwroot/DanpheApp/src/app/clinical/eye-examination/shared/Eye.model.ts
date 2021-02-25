import {
  NgForm,
  FormGroup,
  FormControl,
  Validators,
  FormBuilder,
  ReactiveFormsModule
} from '@angular/forms';
import * as moment from 'moment/moment';
import { RefractionModel } from './Refraction.model';
import { AblationProfileModel } from './AblationProfile.model';
import { LaserDataEntryModel } from './LaserData.model';
import { PreOPPachymetryModel } from './PreOP-Pachymetry.model';
import { LasikRSTModel } from './LasikRST.model';
import { SmileSettingsModel } from './SmileSettings.model';
import { Pachymetry } from './Pachymetry.model';
import { WavefrontModel } from './Wavefront.model';
import { ORAModel } from './ORA.model';
import { SmileIncisionsModel } from './SmileIncisions.model';
import { EyeVisuMaxModel } from './EyeVisuMax.model';
import { OperationNotesModel } from './OperationNotes.model';

export class EyeModel {
  public SNo: number = 0;
  public VisitId: number = 0;
  public PatientId: number = 0;
  public ProviderId: number = 0;
  public Profile: string = null;
  public VisitDate: Date = new Date();
  public ModifiedOn: Date = new Date();
  public CreatedBy: number = 0;
  public CreatedOn: Date = new Date();

  public RefractionOD: Array<RefractionModel> = new Array<RefractionModel>();
  public OperationNotesOD: OperationNotesModel = new OperationNotesModel();
  public AblationOD: AblationProfileModel = new AblationProfileModel();
  public LaserDataOD: Array<LaserDataEntryModel> = new Array<LaserDataEntryModel>();
  public PrePachymetryOD: Array<PreOPPachymetryModel> = new Array <PreOPPachymetryModel>();
  public SXTechniqueOD: String = "";
  public LasikRSTOD: LasikRSTModel = new LasikRSTModel();
  public SmileSettingOD: SmileSettingsModel = new SmileSettingsModel();
  public PachymetryOD: Array<Pachymetry> = new Array<Pachymetry>();
  public WavefrontOD: Array<WavefrontModel> = new Array <WavefrontModel>();
  public ORAOD: Array<ORAModel> = new Array <ORAModel>();
  public SmileIncisionOD: SmileIncisionsModel = new SmileIncisionsModel();
  public VisumaxOD: EyeVisuMaxModel = new EyeVisuMaxModel();

  public RefractionOS: Array<RefractionModel> = new Array<RefractionModel>();
  public OperationNotesOS: OperationNotesModel = new OperationNotesModel();
  public AblationOS: AblationProfileModel = new AblationProfileModel();
  public LaserDataOS: Array<LaserDataEntryModel> = new Array <LaserDataEntryModel>();
  public PrePachymetryOS: Array<PreOPPachymetryModel> = new Array <PreOPPachymetryModel>();
  public SXTechniqueOS: String = "";
  public LasikRSTOS: LasikRSTModel = new LasikRSTModel();
  public SmileSettingOS: SmileSettingsModel = new SmileSettingsModel();
  public PachymetryOS: Array<Pachymetry> = new Array<Pachymetry>();
  public WavefrontOS: Array<WavefrontModel> = new Array <WavefrontModel>();
  public ORAOS: Array<ORAModel> = new Array <ORAModel>();
  public SmileIncisionOS: SmileIncisionsModel = new SmileIncisionsModel();
  public VisumaxOS: EyeVisuMaxModel = new EyeVisuMaxModel();

  constructor() {
    this.RefractionOD.push(new RefractionModel());
    this.RefractionOS.push(new RefractionModel());
    this.LaserDataOD.push(new LaserDataEntryModel());
    this.LaserDataOS.push(new LaserDataEntryModel());
    this.PrePachymetryOD.push(new PreOPPachymetryModel());
    this.PrePachymetryOS.push(new PreOPPachymetryModel());
    this.PachymetryOD.push(new Pachymetry());
    this.PachymetryOS.push(new Pachymetry());
    this.WavefrontOD.push(new WavefrontModel());
    this.WavefrontOS.push(new WavefrontModel());
    this.ORAOD.push(new ORAModel());
    this.ORAOS.push(new ORAModel());

    this.RefractionOD.map(a => a.IsOD = true);
    this.LaserDataOD.map(a => a.IsOD = true);
    this.PrePachymetryOD.map(a => a.IsOD = true);
    this.PachymetryOD.map(a => a.IsOD = true);
    this.WavefrontOD.map(a => a.IsOD = true);
    this.ORAOD.map(a => a.IsOD = true);
    this.AblationOD.IsOD = true;
    this.OperationNotesOD.IsOD = true;
    this.LasikRSTOD.IsOD = true;
    this.SmileIncisionOD.IsOD = true;
    this.SmileSettingOD.IsOD = true;
    this.VisumaxOD.IsOD = true;
  }

}
