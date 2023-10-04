import * as moment from "moment";

export class PharmacyVerificationGridColumn {
    static PurchaseOrderList = [
        { headerName: "PO No", field: "PurchaseOrderNo", width: 110 },
        { headerName: "Supplier", field: "SupplierName", width: 110 },
        {
            headerName: "PO Date",
            field: "PODate",
            width: 100,
            cellRenderer: PharmacyVerificationGridColumn.PurchaseOrderDateOnlyRenderer,
        },
        { headerName: "PO Status", field: "POStatus", width: 110 },
        {
            headerName: "Verification Status",
            width: 100,
            cellRenderer: PharmacyVerificationGridColumn.VerificationStatusRenderer
        },
        {
            headerName: "Action",
            field: "",
            width: 120,
            template: `<a danphe-grid-action="verify" class="grid-action">
            Verify
         </a>`
        }
    ]
    static PurchaseOrderDateOnlyRenderer(params) {
        let date: string = params.data.PoDate;
        return moment(date).format("YYYY-MM-DD");
    }


    static RequisitionList = [
        { headerName: "Req. No", field: "RequisitionNo", width: 70 },
        { headerName: "Requested From", field: "RequestedStoreName", width: 110 },
        {
            headerName: "Req Date",
            field: "RequisitionDate",
            width: 100,
            cellRenderer: PharmacyVerificationGridColumn.RequisitionDateOnlyRenderer,
        },
        { headerName: "Req Status", field: "RequisitionStatus", width: 100 },
        {
            headerName: "Verification Status",
            width: 100,
            cellRenderer: PharmacyVerificationGridColumn.VerificationStatusRenderer
        },
        {
            headerName: "Action",
            field: "",
            width: 120,
            template: `<a danphe-grid-action="verify" class="grid-action">
            Verify
         </a>`
        }
    ]
    static RequisitionDateOnlyRenderer(params) {
        let date: string = params.data.RequisitionDate;
        return moment(date).format("YYYY-MM-DD");
    }

    static VerificationStatusRenderer(params) {
        if (params.data.MaxVerificationLevel > 0) {
            return (
                "<span>" +
                params.data.CurrentVerificationLevelCount +
                " verified out of " +
                params.data.MaxVerificationLevel +
                "</span"
            );
        }
        else {
            return "N/A";
        }
    }
}