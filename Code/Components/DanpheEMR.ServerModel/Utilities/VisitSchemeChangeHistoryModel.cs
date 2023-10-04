using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DanpheEMR.ServerModel.Utilities
{
    public class VisitSchemeChangeHistoryModel
    {
        [Key]
        public int VisitSchemeChangeHistoryId { get; set; }
        public string ChangeAction { get; set; }
        public int PatientId { get; set; }
        public int PatientVisitId { get; set; }
        public int OldSchemeId { get; set; }
        public int OldPriceCategoryId { get; set; }
        public int NewSchemeId { get; set; }
        public int NewPriceCategoryId { get; set; }
        public string Remarks { get; set; }
        public int CreatedBy { get; set; }
        public DateTime CreatedOn { get; set; }
    }
}
