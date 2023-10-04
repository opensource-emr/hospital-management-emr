using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DanpheEMR.ServerModel.SSFModels
{
    public class SSFClaimResponseDetails
    {
        [Key]
        public int Id { get; set; }
        public Int64 ClaimCode { get; set; }
        public string ClaimReferenceNo { get; set; }
        public int PatientId { get; set; }
        public string PatientCode { get; set; }
        public DateTime ClaimedDate { get; set; }
        public string ResponseData { get; set; }
        public string InvoiceNoCSV { get; set; }
        public DateTime ClaimRequestDate { get; set; }
        public string ClaimStatus { get; set; }
        public DateTime ResponseDate { get; set; }
        //public string  ItemName { get; set; }
        //public string ItemCode { get; set; }
        //public decimal ItemPrice { get; set; }
        public Boolean ResponseStatus { get; set; }
        public  int ClaimCount { get; set; }
    }
}
