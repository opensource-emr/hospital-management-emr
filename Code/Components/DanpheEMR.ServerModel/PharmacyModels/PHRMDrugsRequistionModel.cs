using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DanpheEMR.ServerModel.PharmacyModels
{
    public class PHRMDrugsRequistionModel
    {
        [Key]
        public int RequisitionId { get; set; }
        public int VisitId { get; set; }
        public int PatientId { get; set; }
        public string Status { get; set; }
        public string ReferenceId { get; set; }
        public int CreatedBy { get; set; }
        public DateTime CreatedOn { get; set; }

        public virtual List<PHRMDrugsRequistionItemsModel> RequisitionItems { get; set; }


    }
}
