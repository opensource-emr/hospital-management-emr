"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ItemMaster = void 0;
var ItemMaster = /** @class */ (function () {
    function ItemMaster() {
        this.ItemId = 0;
        this.ItemCategoryId = 0;
        this.SubCategoryId = 0;
        this.ItemUsageId = 0;
        this.PackagingTypeId = 0;
        this.ItemName = "";
        this.ItemType = null;
        this.Description = null;
        this.ReOrderQuantity = null;
        this.UnitOfMeasurementId = 0;
        this.MinStockQuantity = 0;
        this.BudgetedQuantity = 0;
        this.StandardRate = 0;
        this.VAT = 0;
        this.CreatedBy = null;
        this.CreatedOn = null;
        this.IsActive = false;
        this.UnitQuantity = null;
        this.Code = null;
        this.UOMName = null;
        this.MSSNO = null;
    }
    return ItemMaster;
}());
exports.ItemMaster = ItemMaster;
//# sourceMappingURL=item-master.model.js.map