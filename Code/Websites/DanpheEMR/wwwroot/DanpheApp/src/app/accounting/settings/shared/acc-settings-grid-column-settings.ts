import { SecurityService } from '../../../security/shared/security.service';
import { CommonFunctions } from "../../../shared/common.functions";

export default class AccSettingsGridColumnSettings {
    static securityService;
    constructor(private _securityService: SecurityService) {

        //remove securityService if not used by any other functions.
        AccSettingsGridColumnSettings.securityService = this._securityService;

        CommonFunctions
    }


    static BillingLedgerMappingGridColumns = [
        { headerName: "Item Code", field: "ItemCode", width: 100 },
        { headerName: "Item Name", field: "ItemName", width: 120 },
        { headerName: "Main-Ledger", field: "LedgerName", width: 120 },
        {
            headerName: "Actions",
            field: "",
            width: 150,
            cellRenderer: AccSettingsGridColumnSettings.BillingLedgerMapingActions_CellRenderer,
        },
        { headerName: "Service Dept.", field: "ServiceDepartmentName", width: 110, },
        { headerName: "LedgerCode", field: "LedgerCode", width: 80 },
        { headerName: "IsActive", field: "IsActive", width: 70 },
    ];


    static BillingLedgerMapingActions_CellRenderer(params) {
        let template = `
            <a danphe-grid-action="map" class="grid-action">Map</a>
        `;

        if (params.data.LedgerCode) {
            if (params.data.IsActive == true) {
                template += `
                    <a danphe-grid-action="activateDeactivateBillingLedgerMapping" class="grid-action">Disable</a>
                `;
            } else {
                template += `
                    <a danphe-grid-action="activateDeactivateBillingLedgerMapping" class="grid-action">Enable</a>
                `;
            }
        }

        return template;
    }


}