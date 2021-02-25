import {
  NgForm,
  FormGroup,
  FormControl,
  Validators,
  FormBuilder,
  ReactiveFormsModule
} from '@angular/forms';
import * as moment from 'moment/moment';

export class SmileSettingsModel {
  public Id: number = 0;
  public MasterId: number = 0;
  public SpotDistanceLent: string = null;
  public SpotDistanceLentSide: string = null;
  public SpotDistanceCap: string = null;
  public SpotDistanceCapSide: string = null;
  public TrackDistanceLent: string = null;
  public TrackDistanceLentSide: string = null;
  public TrackDistanceCap: string = null;
  public TrackDistanceCapSide: string = null;
  public EnergyOffsetLent: string = null;
  public EnergyOffsetLentSide: string = null;
  public EnergyOffsetCap: string = null;
  public EnergyOffsetCapSide: string = null;
  public ScanDirectionLent: string = null;
  public ScanDirectionLentSide: string = null;
  public ScanDirectionCap: string = null;
  public ScanDirectionCapSide: string = null;
  public ScanModeLent: string = null;
  public ScanModeLentSide: string = null;
  public ScanModeCap: string = null;
  public ScanModeCapSide: string = null;
  public MinThicknessLent: string = null;
  public MinThicknessLentSide: string = null;
  public MinThicknessCap: string = null;
  public MinThicknessCapSide: string = null;
  public SidecutLent: string = null;
  public SidecutLentSide: string = null;
  public SidecutCap: string = null;
  public SidecutCapSide: string = null;
  public CreatedBy: number = 0;
  public CreatedOn: Date = new Date();
  public IsOD: boolean;

  constructor() {

  }
  dateValidator(control: FormControl): { [key: string]: boolean } {
    var currDate = moment().format('YYYY-MM-DD HH:mm');
    if (control.value) { // gets empty string for invalid date such as 30th Feb or 31st Nov)
      if ((moment(control.value).diff(currDate) > 0)
        || (moment(currDate).diff(control.value, 'years') > 200)) //can select date upto 200 year past from today.
        return { 'wrongDate': true };
    }
    else
      return { 'wrongDate': true };
  }

}
