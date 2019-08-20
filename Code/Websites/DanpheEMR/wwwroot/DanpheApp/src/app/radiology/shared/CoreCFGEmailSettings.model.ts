import {
  NgForm,
  FormGroup,
  FormControl,
  Validators,
  FormBuilder,
  ReactiveFormsModule
} from '@angular/forms';
export class CoreCFGEmailSettingsModel {
  public SenderEmail: string = null;
  public SenderTitle: string = null;
  public EnableSendEmail: boolean = false;
  public TextContent: boolean = false;
  public PdfContent: boolean = false;
}
