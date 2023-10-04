import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { Observable } from 'rxjs-compat';
import { DanpheHTTPResponse } from '../../shared/common-models';
import { ENUM_DanpheHTTPResponses } from '../../shared/shared-enums';
import { CreditOrganization_DTO } from './DTOs/credit-organization.dto';
import { ClaimManagementBLService } from './claim-management.bl.service';

@Injectable({
  providedIn: 'root'
})
export class ClaimManagementService {
  private isOrganizationSelected = new Subject<boolean>();
  private selectedOrganization = new Subject<CreditOrganization_DTO>();
  private _activeInsuranceProvider: CreditOrganization_DTO;

  constructor(
    private claimManagementBLService: ClaimManagementBLService
  ) { }

  setIsOrganizationSelected(isSelected: boolean) {
    this.isOrganizationSelected.next(isSelected);
  }
  getIsOrganizationSelected(): Observable<boolean> {
    return this.isOrganizationSelected.asObservable();
  }

  public async setSelectedOrganization(selectedOrg: CreditOrganization_DTO) {
    this.selectedOrganization.next(selectedOrg);
  }
  getSelectedOrganization(): Observable<CreditOrganization_DTO> {
    return this.selectedOrganization.asObservable();
  }

  public getActiveInsuranceProvider(): CreditOrganization_DTO {
    return this._activeInsuranceProvider;
  }
  public setActiveInsuranceProvider(currentOrganization: CreditOrganization_DTO) {
    this._activeInsuranceProvider = currentOrganization;
  }
  public removeActiveInsuranceProvider() {
    this._activeInsuranceProvider = null;
  }

  private _isSsfSelected: boolean = false;
  public getIsSsfSelected(): boolean {
    return this._isSsfSelected;
  }
  public setIsSsfSelected(isSsfSelected: boolean) {
    this._isSsfSelected = isSsfSelected;
  }
  public removeIsSsfSelected() {
    this._isSsfSelected = false;
  }

  public async getRespectiveApiIntegrationName(OrganizationId: number): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      this.claimManagementBLService.GetApiIntegrationNameByOrganizationId(OrganizationId).subscribe((res: DanpheHTTPResponse) => {
        if (res.Status === ENUM_DanpheHTTPResponses.OK) {
          resolve(res.Results.ApiIntegrationName);
        } else {
          reject(new Error("Failed to get API integration name"));
        }
      });
    });
  }
}
