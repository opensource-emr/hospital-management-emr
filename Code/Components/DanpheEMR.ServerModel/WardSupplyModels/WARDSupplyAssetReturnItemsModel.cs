using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DanpheEMR.ServerModel
{
    //swapnil-2-april-2021
    public class WARDSupplyAssetReturnItemsModel
    {
        [Key]
        public int ReturnItemId { get; set; }
        public int ItemId { get; set; }
        public int ReturnId { get; set; }

        public int FixedAssetStockId { get; set; }

        public int? SerialNo { get; set; }

        public int CreatedBy { get; set; }

        public DateTime? CreatedOn { get; set; }
       
        public string Remark { get; set; }
    }
}
