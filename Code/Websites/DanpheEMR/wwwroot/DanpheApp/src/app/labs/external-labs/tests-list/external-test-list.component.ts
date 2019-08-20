import { Component, ChangeDetectorRef } from '@angular/core';
import { MessageboxService } from '../../../../../src/app/shared/messagebox/messagebox.service';
import { LabsBLService } from '../../shared/labs.bl.service';
import { PatLabInfoVM } from '../../shared/labTestListWithVendors.model';

@Component({
  templateUrl: './external-test-list.html',
  styles: ['.table tbody tr td{padding: 5px 8px;}']
})
export class ExternalTestListComponent {

   //private patLabInfo = { PatientName: "Sud", TestName: "CBC", VendorName: "External" };

   public patLabInfoList: Array<PatLabInfoVM> = [];

   public searchString: string = null;

   constructor(public msgBox: MessageboxService, public labBLService: LabsBLService, public changeDetector: ChangeDetectorRef) {     
      this.GetAllTestListAssignedToExternal();
   }

   public GetAllTestListAssignedToExternal(){
      this.labBLService.GetAllTestsSendToExternalVendors()
      .subscribe(res => {
         if(res.Status == "OK"){
            this.patLabInfoList = res.Results;
         } else {
            this.msgBox.showMessage('Failed',['Cannot get the List of Patient Test Requisitions !']);
         }
      });      
   }

   
}



