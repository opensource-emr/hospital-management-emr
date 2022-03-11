import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { PHRMStoreModel } from '../../pharmacy/shared/phrm-store.model';
import { MessageboxService } from '../../shared/messagebox/messagebox.service';
import { DispensaryService } from '../shared/dispensary.service';

@Component({
  selector: 'app-activate-dispensary',
  templateUrl: './activate-dispensary.component.html',
  styleUrls: ['./activate-dispensary.component.css']
})
export class ActivateDispensaryComponent implements OnInit {
  dispensaryList: PHRMStoreModel[] = [];

  constructor(public dispensaryService: DispensaryService, public msgBox: MessageboxService, private _router: Router) {
    this.dispensaryService.GetAllDispensaryList()
      .subscribe(res => {
        if (res.Status == "OK") {
          let dispensaryList : any[] = res.Results;
          this.dispensaryList = dispensaryList.filter(a => a.IsActive == true);
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
}
