using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DanpheEMR.ServerModel
{

    public class PHRMPurchaseOrderReportModel
    {
        public DateTime Date { get; set; }
        public string ItemName { get; set; }
        public string POItemStatus { get; set; }
        public double Quantity { get; set; }
        public double ReceivedQuantity { get; set; }
        public decimal StandaredPrice { get; set; }
        public decimal SubTotal { get; set; }
        public decimal VATAmount { get; set; }
        public decimal TotalAmount { get; set; }

    }

    public class PHRMItemWiseStockReportModel
    {
        public string ItemName { get; set; }
        public string ItemTypeName { get; set; }
        public double StockQuantity { get; set; }
        public double StockValue { get; set; }
    }

    public class StockSummaryReportModel
    {
        public int ItemId { get; set; }
        public string ItemName { get; set; }
        public string UOMName { get; set; }
        public int GRItemID { get; set; }
        public int Purchase { get; set; }
        public int StartingQuantity { get; set; }
        public decimal StartingAmount { get; set; }
        public string BatchNo { get; set; }
        public DateTime ExpiryDate { get; set; }
        public decimal GRItemPrice { get; set; }
        public decimal MRP { get; set; }
        public int GRIReceivedQuantity { get; set; }
        public int GRIFreeQuantity { get; set; }
        public decimal GRITotalAmount { get; set; }
        public int RTSQuantity { get; set; }
        public decimal RTSFreeAmount { get; set; }
        public decimal RTSTotalAmount { get; set; }
        public int SalesQuantity { get; set; }
        public decimal SalesTotalAmount { get; set; }
        public int ProvisionalQuantity { get; set; }
        public decimal ProvisionalTotalAmount { get; set; }
        public int ReturnQuantity { get; set; }
        public decimal ReturnTotalAmount { get; set; }
        public int StockManageQuantityIn { get; set; }
        public decimal StockManageAmountIn { get; set; }
        public int StockManageQuantityOut { get; set; }
        public decimal StockManageAmountOut { get; set; }
        public int EndingQuantity { get; set; }
        public decimal EndingAmount { get; set; }
    }
    public class StockSummaryDTO
    {
        public int StoreId { get; set; }
        public string StoreName { get; set; }
        public int ItemId { get; set; }
        public string GenericName { get; set; }
        public string ItemName { get; set; }
        public string ItemCode { get; set; }
        public string UOMName { get; set; }
        public string BatchNo { get; set; }
        public DateTime ExpiryDate { get; set; }
        public decimal CostPrice { get; set; }
        public decimal MRP { get; set; }
        public double OpeningQty { get; set; }
        public double OpeningValue { get; set; }
        public double OpeningQty_WithProvisional { get; set; }
        public double OpeningValue_WithProvisional { get; set; }
        public double PurchaseQty { get; set; }
        public double PurchaseValue { get; set; }
        public double PurchaseReturnQty { get; set; }
        public double PurchaseReturnValue { get; set; }
        public double SalesQty { get; set; }
        public double SalesValue { get; set; }
        public double SaleReturnQty { get; set; }
        public double SaleReturnValue { get; set; }
        public double ProvisionalQty { get; set; }
        public double ProvisionalValue { get; set; }
        public double WriteOffQty { get; set; }
        public double WriteOffValue { get; set; }
        public double ConsumptionQty { get; set; }
        public double ConsumptionValue { get; set; }
        public double StockManageInQty { get; set; }
        public double StockManageInValue { get; set; }
        public double StockManageOutQty { get; set; }
        public double StockManageOutValue { get; set; }
        public double TransferInQty { get; set; }
        public double TransferInValue { get; set; }
        public double TransferOutQty { get; set; }
        public double TransferOutValue { get; set; }
        public double ClosingQty { get; set; }
        public double ClosingValue { get; set; }
        public double ClosingQty_WithProvisional { get; set; }
        public double ClosingValue_WithProvisional { get; set; }
    }
}