import { Component, EventEmitter, Input, Output } from "@angular/core";
import { DanpheHTTPResponse } from "../../../shared/common-models";
import { MessageboxService } from "../../../shared/messagebox/messagebox.service";
import { ENUM_DanpheHTTPResponses, ENUM_MessageBox_Status, ENUM_ProcessConfirmationActions } from "../../../shared/shared-enums";
import { ProcessConfirmationUserCredentials_DTO } from "../DTOs/process-confirmation-userCredentials.dto";
import { UtilitiesBLService } from "../utilities.bl.service";

@Component({
  selector: 'process-confirmation',
  templateUrl: './process-confirmation.component.html'
})
export class ProcessConfirmationComponent {
  public ProcessToConfirmUserCredentials = new ProcessConfirmationUserCredentials_DTO();

  @Input('process-display-name')
  public ProcessDisplayName: string = '';

  @Input('required-permission-name')
  public RequiredPermissionName: string = 'scheme-refund-confirmation-process';


  @Output('confirmation-process-callback')
  public ConfirmationProcessCallback = new EventEmitter<object>();

  public objectToEmit = { action: '' };

  constructor(private messageBoxService: MessageboxService, private utilitiesBlService: UtilitiesBLService) {
  }

  ConfirmProcess(): void {
    this.ProcessToConfirmUserCredentials.PermissionName = this.RequiredPermissionName;
    if (this.ProcessToConfirmUserCredentials.Username !== null && this.ProcessToConfirmUserCredentials.Password !== null && this.ProcessToConfirmUserCredentials.PermissionName !== null) {
      this.utilitiesBlService.ConfirmProcess(this.ProcessToConfirmUserCredentials).subscribe((res: DanpheHTTPResponse) => {
        if (res.Status === ENUM_DanpheHTTPResponses.OK && res.Results && res.Results === true) {
          this.objectToEmit.action = ENUM_ProcessConfirmationActions.confirmSuccess;
          this.ProcessToConfirmUserCredentials = new ProcessConfirmationUserCredentials_DTO();
          this.ConfirmationProcessCallback.emit(this.objectToEmit);
        } else {
          this.messageBoxService.showMessage(ENUM_MessageBox_Status.Error, [`Could not confirm user for ${this.ProcessDisplayName}.`])
        }
      },
        err => {
          console.log(err);
        });
    }
  }
  Close(): void {
    this.objectToEmit.action = ENUM_ProcessConfirmationActions.close;
    this.ConfirmationProcessCallback.emit(this.objectToEmit);
  }
}
