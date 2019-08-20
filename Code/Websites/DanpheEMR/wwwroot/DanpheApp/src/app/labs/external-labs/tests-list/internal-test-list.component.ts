import { Component, ChangeDetectorRef } from '@angular/core';
import { MessageboxService } from '../../../shared/messagebox/messagebox.service';
import { LabsBLService } from '../../shared/labs.bl.service';
import { PatLabInfoVM } from '../../shared/labTestListWithVendors.model';

@Component({
  templateUrl: './internal-test-list.html',
  styles: [` .tbl-container {position: relative;}
    .btnvendor{position:absolute;top:-50px;right:0px;}
.highlightbg{background: #116587; color: #fff;}
.table tbody tr td{padding: 5px 8px;}`]
})
export class InternalTestListComponent {

   //private patLabInfo = { PatientName: "Sud", TestName: "CBC", VendorName: "External" };

   public patLabInfoList: Array<PatLabInfoVM> = [];
   public showVendorSelectButton: boolean = false;
   public showVendorSelectPopup: boolean = false;
   public selectedReqList: Array<number> = [];

   public searchString: string = null;

   constructor(public msgBox: MessageboxService, public labBLService: LabsBLService, public changeDetector: ChangeDetectorRef) {     
      this.GetAllTestListForExternalLabs();
   }

   public GetAllTestListForExternalLabs(){
      this.labBLService.GetAllTestsForExternalLabs()
      .subscribe(res => {
         if(res.Status == "OK"){
            this.patLabInfoList = res.Results;
         } else {
            this.msgBox.showMessage('Failed',['Cannot get the List of Patient Test Requisitions !']);
         }
      });      
   }

   ShowVendorSelection() {

      this.selectedReqList = [];//empty this array before sending the list to popup.

      this.patLabInfoList.forEach(val => {
         if(val.IsSelected){
            this.selectedReqList.push(val.RequisitionId);
         }
      });

      this.showVendorSelectPopup = true;
   }


  CheckForRowSelection() {
     this.showVendorSelectButton = false;
      this.patLabInfoList.forEach(lab => {
         if (lab.IsSelected) {
            this.showVendorSelectButton = true;
            return;
         }
      });

   }

   OnVendorAssigned($event) {
      console.log($event.RequisitionList);
      this.showVendorSelectPopup = false;
      this.showVendorSelectButton = false;
      this.changeDetector.detectChanges();
      this.GetAllTestListForExternalLabs();
      console.log("Vendors assigned successfully.");
   }

   OnVevndorSelectPopupClosed($event) {
       this.showVendorSelectPopup = false;
  }

  SelectUnselectRow(selTest) {
    selTest.IsSelected = !selTest.IsSelected;
    if (selTest.IsSelected) {
      this.showVendorSelectButton = true;
    } else {
      this.CheckForRowSelection();
    }
  }
}



