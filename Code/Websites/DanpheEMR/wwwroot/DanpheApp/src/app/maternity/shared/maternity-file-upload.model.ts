import { FormControl, FormGroup, FormBuilder, Validators } from "@angular/forms";
import * as moment from "moment";

export class MaternityPatientFilesModel {
  public FileId: number = 0;
  public MaternityPatientId: number = 0;
  public PatientId: number = 0;
  public FileName: string = '';
  public DisplayName: string = '';
  public FileType: string = '';
  public IsActive: boolean = true;
  public CreatedOn: string = moment().format();
  public CreatedBy: number = 0;
  public ModifiedOn: string = null;
  public ModifiedBy: number = 0;
  }

