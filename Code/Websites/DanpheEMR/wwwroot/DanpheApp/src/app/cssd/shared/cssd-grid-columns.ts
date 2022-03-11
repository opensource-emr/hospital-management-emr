export default class CSSDGridColumns {
    // PENDING ITEMS COLUMNS START
    static PendingItemColumns = [
        { headerName: "Request Date", field: "RequestDate" },
        { headerName: "Item Name", field: "ItemName" },
        { headerName: "Code", field: "ItemCode" },
        { headerName: "Tag Number", field: "TagNumber" },
        { headerName: "Requested From", field: "RequestedFrom" },
        { headerName: "Requested By", field: "RequestedBy" },
        { headerName: "Action", field: "", template: `<a danphe-grid-action="disinfect-item" class="grid-action">Disinfect</a>` }
    ];
    // PENDING ITEMS COLUMNS END

    // Finalized ITEMS COLUMNS START
    static FinalizedItemColumns = [
        { headerName: "Request Date", field: "RequestDate" },
        { headerName: "Item Name", field: "ItemName" },
        { headerName: "Code", field: "ItemCode" },
        { headerName: "Tag Number", field: "TagNumber" },
        { headerName: "Requested From", field: "RequestedFrom" },
        { headerName: "Requested By", field: "RequestedBy" },
        { headerName: "Disinfectant", field: "Disinfectant" },
        { headerName: "DisinfectedDate", field: "DisinfectedDate" },
        { headerName: "DisinfectedBy", field: "DisinfectedBy" },
        { headerName: "Action", field: "", template: `<a danphe-grid-action="dispatch-item" class="grid-action">Dispatch</a>` }
    ];
    // Finalized ITEMS COLUMNS END

    // Integrated CSSD Report COLUMNS START
    static IntegratedCssdReportColumns = [
        { headerName: "Request Date", field: "RequestDate" },
        { headerName: "Item Name", field: "ItemName" },
        { headerName: "Code", field: "ItemCode" },
        { headerName: "Tag Number", field: "TagNumber" },
        { headerName: "Requested From", field: "RequestedFrom" },
        { headerName: "Requested By", field: "RequestedBy" },
        { headerName: "Disinfectant", field: "Disinfectant" },
        { headerName: "DisinfectedDate", field: "DisinfectedDate" },
        { headerName: "DisinfectedBy", field: "DisinfectedBy" },
        { headerName: "DispatchedDate", field: "DispatchedDate" },
        { headerName: "DispatchedBy", field: "DispatchedBy" },
    ];
    // Integrated CSSD Report COLUMNS END
}