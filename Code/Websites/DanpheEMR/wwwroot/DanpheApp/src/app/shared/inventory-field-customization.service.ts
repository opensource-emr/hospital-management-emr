import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { CoreService } from "../core/shared/core.service";
import { ENUM_ParameterGroupName, ENUM_ParameterName } from '../shared/shared-enums'

@Injectable()
export class InventoryFieldCustomizationService {
    inventoryFieldCustomizationModel: InventoryFieldCustomizationModel = new InventoryFieldCustomizationModel();
    constructor(private http: HttpClient, private _coreService: CoreService) { }

    GetInventoryFieldCustomization(): InventoryFieldCustomizationModel {
        let parameter = this._coreService.Parameters.find(p => p.ParameterName.toLocaleLowerCase() === ENUM_ParameterName.InventoryFiledCustomization.toLocaleLowerCase() && p.ParameterGroupName.toLocaleLowerCase() === ENUM_ParameterGroupName.Inventory.toLocaleLowerCase());
        if (parameter) {
            let ParameterValue = JSON.parse(parameter.ParameterValue);
            this.inventoryFieldCustomizationModel.showSpecification = ParameterValue.showSpecification;
            this.inventoryFieldCustomizationModel.showBarcode = ParameterValue.showBarcode;
            return this.inventoryFieldCustomizationModel;
        }
    }
}
export class InventoryFieldCustomizationModel {
    showBarcode: boolean = false;
    showSpecification: boolean = false;
}
