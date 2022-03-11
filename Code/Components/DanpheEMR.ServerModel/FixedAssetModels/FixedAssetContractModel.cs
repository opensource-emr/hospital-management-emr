using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DanpheEMR.ServerModel
{
    public class FixedAssetContractModel
    {
        [Key]
        public int AssetContractId { get; set; }
        public int FixedAssetStockId { get; set; }
        public string ContractFileName { get; set; }
        public string FileExtention { get; set; }
        public DateTime? CreatedOn { get; set; }
        public int? CreatedBy { get; set; }
        public DateTime? ModifiedOn { get; set; }
        public int? ModifiedBy { get; set; }

        [NotMapped]
        public byte[] FileBinaryData { get; set; }
    }
}
