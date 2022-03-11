import { Component, OnInit } from '@angular/core';
import { ADT_BLService } from '../../../adt/shared/adt.bl.service';
import { MessageboxService } from '../../../shared/messagebox/messagebox.service';
import { Ward } from '../../../adt/shared/ward.model';
import { SecurityService } from '../../../security/shared/security.service';
import { Router } from '@angular/router';
import { Observable, of, forkJoin } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { CoreService } from '../../../core/shared/core.service';

@Component({
  selector: 'app-activate-ward',
  templateUrl: './activate-ward.html'
})
export class ActivateWardComponent implements OnInit {
  public wardList: Array<Ward> = [];
  public wardBedInfoList: Array<{ WardId, TotalBed, Occupied, Vacant }> = [];
  IsReceiveFeatureEnabled: boolean = false;

  constructor(private _adtBLService: ADT_BLService,
    private _messageBoxService: MessageboxService,
    private _securityService: SecurityService, private coreService: CoreService,
    private _router: Router) {
    var reqs: Observable<any>[] = [];
    reqs.push(this._adtBLService.GetWards().pipe(
      catchError((err) => {
        // Handle specific error for this call
        return of(err.error);
      }
      )
    ));
    reqs.push(this._adtBLService.GetAllWardBedInfo().pipe(
      catchError((err) => {
        // Handle specific error for this call
        return of(err.error);
      }
      )
    ));
    forkJoin(reqs).subscribe(result => {
      this.CallBackGetAllWard(result[0]);
      this.CallBackGetAllWardBedInfo(result[1]);
      this.MapWardWithInfo();
    });
    this.IsReceiveFeatureEnabled = this.coreService.IsReserveFeatureEnabled();
  }

  ngOnInit() {
    
  }
  private CallBackGetAllWard(res) {
    if (res.Status == "OK") {
      this.wardList = res.Results;
      if (this.wardList && this.wardList.length) {
        this.wardList.forEach(W => {
          W["PermissionInfo"] = '{"name":"ward-' + W.WardName + '","actionOnInvalid":"remove"}';
        });
      }
    }
    else {
      this._messageBoxService.showMessage("Failed", ["Failed to load ward.", res.ErrorMessage]);
    }
  }
  private CallBackGetAllWardBedInfo(res) {
    if (res.Status == "OK") {
      this.wardBedInfoList = res.Results;
    }
    else {
      console.log(res.ErrorMessage);
    }
  }
  private MapWardWithInfo() {
    this.wardList.forEach(ward => {
      var selectedWardBedInfo = this.wardBedInfoList.find(wardBedInfo => wardBedInfo.WardId == ward.WardId);
      if (selectedWardBedInfo) {
        ward.OccupiedBeds = selectedWardBedInfo.Occupied;
        ward.VacantBeds = selectedWardBedInfo.Vacant;
        ward.TotalBeds = selectedWardBedInfo.TotalBed;
      }
      else {
        ward.TotalBeds = ward.OccupiedBeds = ward.VacantBeds = 0;
      }
    });
  }

  setGlobalWard(wardId: number) {
    var selectedWard = this.wardList.find(a => a.WardId == wardId);
    this._securityService.setActiveWard(selectedWard);
    this._router.navigate(['/Nursing/InPatient/InPatientList']);
  }
}
