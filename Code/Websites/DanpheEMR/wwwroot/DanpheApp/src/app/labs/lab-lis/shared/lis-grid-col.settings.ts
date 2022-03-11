//This grid is to show list of Lab Report Templates
import * as moment from 'moment/moment';
import { SecurityService } from '../../../security/shared/security.service';
import { CommonFunctions } from '../../../shared/common.functions';

export default class LabLISGridColumnSettings {

    static securityServ: any;
    constructor(public securityService: SecurityService) {
        LabLISGridColumnSettings.securityServ = this.securityService;
    }


    public static ComponentMappingListCols = [
        { headerName: "Machine Name", field: "MachineName", width: 120 },
        { headerName: "Component Name", field: "ComponentName", width: 140 },
        { headerName: "LIS Component Name", field: "LISComponentName", width: 140 },
        { headerName: "Conversion Factor", field: "ConversionFactor", width: 80 },
        {
            headerName: "Actions",
            width: 100,
            template:
                `<a danphe-grid-action="edit" class="grid-action">
                Edit
                </a>
                <a danphe-grid-action="delete" class="grid-action">
                Remove
                </a>
                `
        }

    ];


}
