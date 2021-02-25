import { Injectable } from '@angular/core';
import { CodeDetailsModel } from '../../shared/code-details.model';
import { CoreService } from '../../core/shared/core.service';
@Injectable()
export class AccountingService {
      public CodeData: Array<CodeDetailsModel> = new Array<CodeDetailsModel>();
      public VoucherNumber: string = null;
      public IsEditVoucher: boolean = false;
      constructor(public coreService: CoreService) {
            this.GetAccountingCodes();
      }
      GetAccountingCodes() {
            this.CodeData = this.coreService.CodeDetails;
      }
      public getnamebyCode(code) {
            var codeList = this.CodeData.filter(a => a.Code == code);
            return (codeList.length > 0) ? codeList.find(a => a.Code == code).Name : "";
      }
}
