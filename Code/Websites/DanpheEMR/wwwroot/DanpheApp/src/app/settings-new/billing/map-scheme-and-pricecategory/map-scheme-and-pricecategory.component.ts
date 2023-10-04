import { Component, OnInit } from '@angular/core';
import { CoreService } from '../../../core/shared/core.service';
import { SecurityService } from '../../../security/shared/security.service';
import { DanpheHTTPResponse } from '../../../shared/common-models';
import { GridEmitModel } from '../../../shared/danphe-grid/grid-emit.model';
import { SettingsGridColumnSettings } from '../../../shared/danphe-grid/settings-grid-column-settings';
import { MessageboxService } from '../../../shared/messagebox/messagebox.service';
import { ENUM_DanpheHTTPResponses, ENUM_MessageBox_Status } from '../../../shared/shared-enums';
import { SettingsBLService } from '../../shared/settings.bl.service';
import { SchemeVsPriceCategoryDTO } from './shared/MapSchemeVsPriceCategory.dto';

@Component({
  selector: 'map-scheme-and-pricecategory',
  templateUrl: './map-scheme-and-pricecategory-list.component.html',
  styleUrls: ['./map-scheme-and-pricecategory-list.component.css']
})
export class MapSchemeAndPriceCategoryComponent implements OnInit {

  public mapSchemePriceCategoryColumns: Array<any> = null;
  public SchemePriceCategoryList: Array<SchemeVsPriceCategoryDTO> = new Array<SchemeVsPriceCategoryDTO>();
  public selectedSchemePriceCategory: SchemeVsPriceCategoryDTO = new SchemeVsPriceCategoryDTO();
  public setBillItmGriColumns: SettingsGridColumnSettings = null;
  public showAddSchemePricePriceCategoryItemPopUp: boolean = false;
  public update: boolean = false;
  constructor(
    private coreService: CoreService,
    private securityService: SecurityService,
    private settingsBLService: SettingsBLService,
    private messageBoxService: MessageboxService
  ) {
    this.setBillItmGriColumns = new SettingsGridColumnSettings(this.coreService.taxLabel, this.securityService);
    this.mapSchemePriceCategoryColumns = this.setBillItmGriColumns.SchemeVsPriceCategoryGridCols;
  }

  ngOnInit() {
    this.GetSchemePriceCategoryMappedItems();
  }

  public logError(err: any): void {
    console.log(err);
  }
  public AddSchemeVsPriceCategorySettings(): void {
    this.update = false;
    this.showAddSchemePricePriceCategoryItemPopUp = true;
  }

  public ReportingItemGridActions(event: GridEmitModel): void {
    if (event) {
      let action = event.Action;
      let data = event.Data;
      if (action === 'edit') {
        this.selectedSchemePriceCategory = event.Data;
        this.update = true;
        this.showAddSchemePricePriceCategoryItemPopUp = true;
      }
      else if (action === 'activateDeactivateSchemeVsPriceCategoryItem') {
        if (data) {
          this.ActivateDeactivateSchemePriceCategoryMapItem(data.PriceCategorySchemeMapId, data.IsActive);
        }

      }
    }
  }

  public CallBackAdd(event): void {
    if (event === true) {
      this.showAddSchemePricePriceCategoryItemPopUp = false;
      this.GetSchemePriceCategoryMappedItems();
    }
  }

  public GetSchemePriceCategoryMappedItems() {
    this.settingsBLService.GetSchemePriceCategoryMappedItems().subscribe(
      (res: DanpheHTTPResponse) => {
        if (res.Status === ENUM_DanpheHTTPResponses.OK) {
          this.SchemePriceCategoryList = res.Results;
        } else {
          this.messageBoxService.showMessage(ENUM_MessageBox_Status.Failed, [
            "Billing Scheme not available",
          ]);
        }
      },
      (err) => {
        this.logError(err);
      }
    );
  }

  public ActivateDeactivateSchemePriceCategoryMapItem(PriceCategorySchemeMapId: number, Status: boolean): void {
    Status = !Status;
    this.settingsBLService.ActivateDeactivateSchemePriceCategoryMapItem(PriceCategorySchemeMapId, Status)
      .subscribe(
        (res: DanpheHTTPResponse) => {
          if (res.Status === ENUM_DanpheHTTPResponses.OK) {
            this.messageBoxService.showMessage(ENUM_MessageBox_Status.Success, [
              `${Status ? 'Activated' : 'Deactivated'} Successfully`,
            ]);
            this.GetSchemePriceCategoryMappedItems();
          } else {
            this.messageBoxService.showMessage(ENUM_MessageBox_Status.Error, [
              `Unable to ${Status ? 'Activate' : 'Deactivate'}`,
            ]);
          }
        },
        (err) => {
          this.logError(err);
        }
      );
  }


}
