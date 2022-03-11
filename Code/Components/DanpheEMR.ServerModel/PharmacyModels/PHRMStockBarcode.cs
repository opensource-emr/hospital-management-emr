using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using DanpheEMR.DalLayer;

namespace DanpheEMR.ServerModel
{
    public class PHRMStockBarcode
    {
        #region CTOR
        public PHRMStockBarcode() { }
        public PHRMStockBarcode(int barcodeId, int itemId, string batchNo, DateTime? expiryDate, decimal mrp, int createdBy, DateTime createdOn)
        {
            BarcodeId = barcodeId;
            ItemId = itemId;
            BatchNo = batchNo;
            ExpiryDate = expiryDate;
            MRP = mrp;
            CreatedBy = createdBy;
            CreatedOn = createdOn;
        }
        #endregion

        #region Properties
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.None)]
        public int BarcodeId { get; private set; }
        public int ItemId { get; private set; }
        public string BatchNo { get; private set; }
        public DateTime? ExpiryDate { get; private set; }
        public decimal MRP { get; private set; }
        public int CreatedBy { get; private set; }
        public DateTime CreatedOn { get; private set; }
        #endregion
    }
}
