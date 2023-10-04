import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { PHRMStoreModel } from '../../pharmacy/shared/phrm-store.model';
import { SecurityService } from '../../security/shared/security.service';
import { MessageboxService } from '../../shared/messagebox/messagebox.service';
import { DispensaryService } from '../shared/dispensary.service';

@Component({
  selector: 'app-activate-dispensary',
  templateUrl: './activate-dispensary.component.html',
  styleUrls: ['./activate-dispensary.component.css']
})
export class ActivateDispensaryComponent implements OnInit {
  dispensaryList: PHRMStoreModel[] = [];
  currentDispensary: number = 0;
  currentDispensaryName: any;
  selectedDispensary: any = null;

  constructor(public dispensaryService: DispensaryService, public msgBox: MessageboxService, private _router: Router, public securityService: SecurityService) {

    this.dispensaryService.GetAllDispensaryList()
      .subscribe(res => {
        if (res.Status == "OK") {
          let dispensaryList: any[] = res.Results;
          this.dispensaryList = dispensaryList.filter(a => a.IsActive == true);

          if (this.dispensaryList.length == 1) {
            this.msgBox.showMessage("Notice-Message", [`You are only allowed to see ${this.dispensaryList[0].Name}.`]);
            this.setGlobalDispensary(this.dispensaryList[0].StoreId);
          }
          if (this.dispensaryList.length > 1) {
            this.getActiveDispensary();
          }
        }
        else {
          this.msgBox.showMessage("Failed", ["Failed to load dispensary list."]);
        }
      }, () => {
        this.msgBox.showMessage("Failed", ["Failed to load dispensary list."]);
      });

  }

  ngOnInit() {
  }
  setGlobalDispensary(storeId: number) {
    var selectedDispensary = this.dispensaryList.find(a => a.StoreId == storeId);
    this.dispensaryService.activeDispensary = selectedDispensary;
    this._router.navigate(['/Dispensary/Sale']);
  }

  ActivateDispensary(dispensary) {
    this.dispensaryService.ActivateDispensary(dispensary.StoreId, dispensary.Name).subscribe(
      res => {
        if (res.Status == "OK") {
          let activeDispensary = res.Results;
          this.securityService.getActiveStore().Name = activeDispensary.StoreId;
          this.currentDispensary = activeDispensary;
          this.dispensaryList.forEach((d) => {
            if (d.StoreId == this.currentDispensary) {
              this.currentDispensaryName = d.Name;
            }
          });
        }
      }
    )
  }
  getActiveDispensary() {
    this.dispensaryService.getActiveDispensary().subscribe(res => {
      if (res.Status == "OK") {
        this.selectedDispensary = res.Results;
        if (this.selectedDispensary.StoreId != null && this.selectedDispensary.StoreId != 0) {
          this.setGlobalDispensary(this.selectedDispensary.StoreId);
        }
      }
      else {
        this.msgBox.showMessage("Failed", ["Failed to load dispensary"]);
      }
    })
  }
}
