using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DanpheEMR.ServerModel
{
    public class PHRMPrescriptionItemModel
    {
        [Key]
        public int PrescriptionItemId { get; set; }
        public int PatientId { get; set; }
        public int? ProviderId { get; set; }
        public int? ItemId { get; set; }//when order is given with generic, it could be null.
        public Nullable<double> Quantity { get; set; }
        public int? Frequency { get; set; }
        public DateTime? StartingDate { get; set; }
        public int? HowManyDays { get; set; }
        public string Notes { get; set; }        
        public int? CreatedBy { get; set; }
        public DateTime? CreatedOn { get; set; }
        public string OrderStatus { get; set; }

        public string Dosage { get; set; }//sud: 6July'18
        public int? GenericId { get; set; }//sud: 6July'18
        public int? ModifiedBy { get; set; }
        public DateTime? ModifiedOn { get; set; }

        public int? DiagnosisId { get; set; }        

        [NotMapped]
        public string ProviderName { get; set; }

    }
}
