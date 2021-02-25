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
        public int ItemId { get; set; }
        public string ItemName { get; set; }
        public string UOMName { get; set; }
        public int OpeningQuantity { get; set; }
        public decimal OpeningAmount { get; set; }
        public int Purchase { get; set; }
        public decimal PurchaseAmount { get; set; }
        public int PurchaseReturn { get; set; }
        public decimal PurchaseReturnAmount { get; set; }
        public int StockManageIn { get; set; }
        public decimal StockManageInAmount { get; set; }
        public int StockManageOut { get; set; }
        public decimal StockManageOutAmount { get; set; }
        public int Sale { get; set; }
        public decimal SaleAmount { get; set; }
        public int SaleReturn { get; set; }
        public decimal SaleReturnAmount { get; set; }
        public int ClosingQuantity { get; set; }
        public decimal ClosingAmount { get; set; }
    }
    public class GrandTotalDTO
    {
        public int OpeningQuantity { get; set; }
        public decimal OpeningAmount { get; set; }
        public int Purchase { get; set; }
        public decimal PurchaseAmount { get; set; }
        public int PurchaseReturn { get; set; }
        public decimal PurchaseReturnAmount { get; set; }
        public int StockManageIn { get; set; }
        public decimal StockManageInAmount { get; set; }
        public int StockManageOut { get; set; }
        public decimal StockManageOutAmount { get; set; }
        public int Sale { get; set; }
        public decimal SaleAmount { get; set; }
        public int SaleReturn { get; set; }
        public decimal SaleReturnAmount { get; set; }
        public int ClosingQuantity { get; set; }
        public decimal ClosingAmount { get; set; }
    }
}
