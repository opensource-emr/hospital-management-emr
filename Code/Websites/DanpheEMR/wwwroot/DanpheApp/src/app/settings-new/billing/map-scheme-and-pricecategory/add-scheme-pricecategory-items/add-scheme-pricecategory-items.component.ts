import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CoreService } from '../../../../core/shared/core.service';
import { Scheme_DTO } from '../../../../pharmacy/patient-consumption/shared/scheme.dto';
import { PriceCategory_DTO } from '../../../../settings-new/shared/DTOs/price-category.dto';
import { SettingsBLService } from '../../../../settings-new/shared/settings.bl.service';
import { DanpheHTTPResponse } from '../../../../shared/common-models';
import { MessageboxService } from '../../../../shared/messagebox/messagebox.service';
import { ENUM_DanpheHTTPResponses, ENUM_MessageBox_Status } from '../../../../shared/shared-enums';
import { SchemeVsPriceCategoryDTO } from '../shared/MapSchemeVsPriceCategory.dto';
import { SchemeVsPriceCategoryModel } from '../shared/MapSchemeVsPriceCategory.model';

@Component({
  selector: 'add-scheme-pricecategory-items',
  templateUrl: './add-scheme-pricecategory-items.component.html',
  styleUrls: ['./add-scheme-pricecategory-items.component.css'],
  host: { '(window:keydown)': 'hotkeys($event)' }
})
export class AddSchemePriceCategoryItemsComponent implements OnInit {
  @Input('showAddSchemePricePriceCategoryItemPopUp')
  public showAddSchemePricePriceCategoryItemPopUp: boolean = false;
  @Input('selectedSchemePriceCategory')
  public SelectedSchemePriceCategory: SchemeVsPriceCategoryDTO = new SchemeVsPriceCategoryDTO();

  @Output('on-AddSchemePricePriceCategoryItemPopUp-close')
  public hideAddSchemePricePriceCategoryItemPopUp: EventEmitter<boolean> = new EventEmitter<boolean>();

  public SchemePriceCategoryMap: SchemeVsPriceCategoryDTO = new SchemeVsPriceCategoryDTO();
  public SchemePriceCategoryMapList: Array<SchemeVsPriceCategoryDTO> = new Array<SchemeVsPriceCategoryDTO>();
  @Input('update')
  public update: boolean = false;
  public Schemes: Array<Scheme_DTO> = new Array<Scheme_DTO>();
  public PriceCategories: Array<PriceCategory_DTO> = new Array<PriceCategory_DTO>();
  public currentScheme: Scheme_DTO = null;
  public currentPriceCategory: PriceCategory_DTO = null;
  public confirmationTitle: string = "Confirm !";
  public confirmationMessageForSave: string = "Are you sure you want to Save the SchemePriceCategoryMapItem?";
  public confirmationMessageForUpdate: string = "Are you sure you want to Update the SchemePriceCategoryMapItem?";
  public loading: boolean = false;
  constructor(
    private coreService: CoreService,
    private settingsBLService: SettingsBLService,
    private messageBoxService: MessageboxService
  ) {

  }

  ngOnInit() {
    (async () => {
      await this.GetBillingSchemes();
      await this.GetPriceCategory();

      this.SchemePriceCategoryMapList = new Array<SchemeVsPriceCategoryDTO>();
      if (this.update) {
        if (this.SelectedSchemePriceCategory) {
          this.currentScheme = this.Schemes.find(a => a.SchemeId === this.SelectedSchemePriceCategory.SchemeId);
          this.currentPriceCategory = this.PriceCategories.find(a => a.PriceCategoryId === this.SelectedSchemePriceCategory.PriceCategoryId);
          this.SchemePriceCategoryMap.PriceCategorySchemeMapId = this.SelectedSchemePriceCategory.PriceCategorySchemeMapId;
          this.SchemePriceCategoryMap.SchemeId = this.currentScheme.SchemeId
          this.SchemePriceCategoryMap.PriceCategoryId = this.currentPriceCategory.PriceCategoryId
          this.currentPriceCategory = this.PriceCategories.find(a => a.PriceCategoryId === this.SelectedSchemePriceCategory.PriceCategoryId);
          this.SchemePriceCategoryMap.IsDefault = this.SelectedSchemePriceCategory.IsDefault;
          this.SchemePriceCategoryMap.IsActive = this.SelectedSchemePriceCategory.IsActive;
        }
      }
    })()
      .catch(error => {
        this.messageBoxService.showMessage(ENUM_MessageBox_Status.Error, [
          "Unable to fetch Billing Schemes & Price Categories",
        ]);
      });
  }

  public logError(err: any): void {
    console.log(err);
  }

  public hotkeys(event): void {
    if (event.keyCode === 27) {
      this.CloseAddSchemePricePriceCategoryItemPopUp();
    }
  }
  public CloseAddSchemePricePriceCategoryItemPopUp(): void {
    this.showAddSchemePricePriceCategoryItemPopUp = false;
    this.hideAddSchemePricePriceCategoryItemPopUp.emit(true);
    this.update = false;
  }

  public SchemeListFormatter(data: any): string {
    return data["SchemeName"];
  }

  public PriceCategoryListFormatter(data: any): string {
    return data["PriceCategoryName"];
  }

  public AssignSelectedSchemeItem(event): void {
    if (event) {
      this.SchemePriceCategoryMap.SchemeId = event.SchemeId;
      this.SchemePriceCategoryMap.SchemeName = event.SchemeName;
    }
  }

  public AssignSelectedPriceCategoryItem(event): void {
    if (event) {
      this.SchemePriceCategoryMap.PriceCategoryId = event.PriceCategoryId;
      this.SchemePriceCategoryMap.PriceCategoryName = event.PriceCategoryName;
    }
  }

  public async GetBillingSchemes() {
    try {
      const res: DanpheHTTPResponse = await this.settingsBLService.GetBillingSchemes().toPromise();

      if (res.Status === ENUM_DanpheHTTPResponses.OK) {
        this.Schemes = res.Results;
      } else {
        this.messageBoxService.showMessage(ENUM_MessageBox_Status.Failed, [
          "Unable to fetch Billing Schemes",
        ]);
      }
    } catch (error) {
      this.messageBoxService.showMessage(ENUM_MessageBox_Status.Error, [
        "Unable to fetch Billing Schemes",
      ]);
    }
  }

  public async GetPriceCategory() {
    try {
      const res: DanpheHTTPResponse = await this.settingsBLService.GetPriceCategory().toPromise();

      if (res.Status === ENUM_DanpheHTTPResponses.OK) {
        this.PriceCategories = res.Results;
      } else {
        this.messageBoxService.showMessage(ENUM_MessageBox_Status.Failed, [
          "Unable to fetch Price Categories",
        ]);
      }
    } catch (error) {
      this.messageBoxService.showMessage(ENUM_MessageBox_Status.Error, [
        "Unable to fetch Price Categories",
      ]);
    }
  }

  public AddSchemePriceCategorySettingsItemToTable(): void {
    if (this.CheckValidation() === true) {
      this.SchemePriceCategoryMapList.push(this.SchemePriceCategoryMap);
      this.currentScheme = null;
      this.currentPriceCategory = null;
      this.SchemePriceCategoryMap = new SchemeVsPriceCategoryDTO();
    }
  }

  public CheckValidation(): boolean {
    if (this.SchemePriceCategoryMap.PriceCategoryId === 0 || this.SchemePriceCategoryMap.SchemeId === 0) {
      if (this.SchemePriceCategoryMap.PriceCategoryId === 0) {
        this.messageBoxService.showMessage(ENUM_MessageBox_Status.Warning, [
          "Price Category is required.",
        ]);
      }
      if (this.SchemePriceCategoryMap.SchemeId === 0) {
        this.messageBoxService.showMessage(ENUM_MessageBox_Status.Warning, [
          "Scheme is required.",
        ]);
      }
      return false;
    }
    else {
      return true;
    }
  }

  public Discard(): void {
    this.CloseAddSchemePricePriceCategoryItemPopUp();
  }

  public PostSchemePriceCategoryMapItems(schemePriceCategoryMapList: SchemeVsPriceCategoryDTO[]): void {
    if (schemePriceCategoryMapList.length > 0) {
      const TempSchemePriceCategoryMapList: SchemeVsPriceCategoryModel[] = [];
      schemePriceCategoryMapList.forEach(item => {
        let schemePriceCategory = new SchemeVsPriceCategoryModel();
        schemePriceCategory.PriceCategorySchemeMapId = item.PriceCategorySchemeMapId;
        schemePriceCategory.SchemeId = item.SchemeId;
        schemePriceCategory.PriceCategoryId = item.PriceCategoryId;
        schemePriceCategory.IsDefault = item.IsDefault;
        schemePriceCategory.IsActive = true;
        TempSchemePriceCategoryMapList.push(schemePriceCategory);
      })
      this.settingsBLService.PostSchemePriceCategoryMapItems(TempSchemePriceCategoryMapList)
        .finally(() => { this.loading = false; })
        .subscribe(
          (res: DanpheHTTPResponse) => {
            if (res.Status === ENUM_DanpheHTTPResponses.OK) {
              this.SchemePriceCategoryMapList = new Array<SchemeVsPriceCategoryDTO>();
              this.messageBoxService.showMessage(ENUM_MessageBox_Status.Success, [
                "Scheme PriceCategory Mapped Successfully.",
              ]);
            } else {
              this.messageBoxService.showMessage(ENUM_MessageBox_Status.Error, [
                "Unable to Map Scheme PriceCategory.",
              ]);
            }
          },
          (err) => {
            this.logError(err);
          }
        );
    }
    else {
      this.loading = false;
      this.messageBoxService.showMessage(ENUM_MessageBox_Status.Notice, [
        "Add at least 1 item.",
      ]);
    }
  }

  public UpdateSchemePriceCategoryMapItems(schemePriceCategoryMap: SchemeVsPriceCategoryDTO): void {
    if (this.CheckValidation() === true) {
      let TempSchemePriceCategoryMap = new SchemeVsPriceCategoryModel();
      TempSchemePriceCategoryMap.PriceCategorySchemeMapId = schemePriceCategoryMap.PriceCategorySchemeMapId;
      TempSchemePriceCategoryMap.SchemeId = schemePriceCategoryMap.SchemeId;
      TempSchemePriceCategoryMap.PriceCategoryId = schemePriceCategoryMap.PriceCategoryId;
      TempSchemePriceCategoryMap.IsDefault = schemePriceCategoryMap.IsDefault;
      TempSchemePriceCategoryMap.IsActive = schemePriceCategoryMap.IsActive;
      this.settingsBLService.UpdateSchemePriceCategoryMapItems(TempSchemePriceCategoryMap)
        .finally(() => { this.loading = false; })
        .subscribe(
          (res: DanpheHTTPResponse) => {
            if (res.Status === ENUM_DanpheHTTPResponses.OK) {
              this.CloseAddSchemePricePriceCategoryItemPopUp();
              this.messageBoxService.showMessage(ENUM_MessageBox_Status.Success, [
                "Scheme PriceCategory Updated Successfully.",
              ]);
            } else {
              this.messageBoxService.showMessage(ENUM_MessageBox_Status.Error, [
                "Unable to Update Scheme PriceCategory.",
              ]);
            }
          },
          (err) => {
            this.logError(err);
          }
        );
    }
  }

  public HandleConfirmationForSave(): void {
    this.loading = true;
    this.PostSchemePriceCategoryMapItems(this.SchemePriceCategoryMapList);
  }

  public HandleConfirmationForUpdate(): void {
    this.loading = true;
    this.UpdateSchemePriceCategoryMapItems(this.SchemePriceCategoryMap)
  }

  public HandleCancel(): void {

  }

}
