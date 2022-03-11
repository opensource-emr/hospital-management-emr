using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DanpheEMR.ServerModel.InventoryModels.InventoryReportModel
{
   public class ApprovedMaterialStockRegisterModel
    {
        public String MSSNO { get; set; }
        public int ItemId { get; set; }
        public string SupplierName { get; set; }
        public string  LocationInStores { get; set; }
        public string UOMName { get; set; }
        public string Code { get; set; }

        public int MinimumStockQuantity { get; set; }

        public Nullable<DateTime> Date { get; set; }

        //Approved Material Received from Supplier
        public int GRNNo { get; set; }

        public Nullable<DateTime> GRNDate { get; set; }
        public string LotNo { get; set; }
        public DateTime ExpiryDate { get; set; }
        public int GRNQuantity { get; set; }

        //Excess Material Return From User Department 

        public int EMRNNo { get; set; }


        public Nullable<DateTime> EMRNDate { get; set; }

        public string EMRNLotNo { get; set; }
        public DateTime EMRNExpiryDate { get; set; }

        public int EMRNQuantity { get; set; }


        //Material Issued to thw User Department 

        public int MINNo { get; set; }


        public Nullable<DateTime> MINDate { get; set; }

        public string MINLotNo { get; set; }
        public DateTime MINExpiryDate { get; set; }

        public int MINQuantity { get; set; }

        //Closing Stock (verified Actual Vs Record On every Month last day )

        public string LastLotNo { get; set; }
        public DateTime LastExpiryDate { get; set; }

        public int LastQuantity { get; set; }








    }
}
