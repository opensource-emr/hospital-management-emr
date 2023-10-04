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
    public  class WARDSupplyAssetReturnModel
    {
        [Key]
        public int ReturnId { get; set; }

        public int StoreId { get; set; }

        public int SubStoreId { get; set; }


        public DateTime? ReturnDate { get; set; }


        [NotMapped]
        public string ItemName { get; set; }

        public string Remarks { get; set; }
        public int CreatedBy { get; set; }

        public DateTime? CreatedOn { get; set; }
        public DateTime? ModifiedOn { get; set; }
        public int? ModifiedBy { get; set; }

        [NotMapped]
        public virtual List<WARDSupplyAssetReturnItemsModel> ReturnItemsList { get; set; }
        [NotMapped]
        public int MaxVerificationLevel { get; set; }
        [NotMapped]
        public string StoreName { get; set; }
        [NotMapped]
        public int? VerificationId { get; set; }
    }
}
