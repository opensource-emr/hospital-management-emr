using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DanpheEMR.ServerModel
{
    public class LabRunNumberSettingsModel
    {
        [Key]
        public int RunNumberFormatId { get; set; }
        public string RunNumberFormatName { get; set; }
        public int RunNumberGroupingIndex { get; set; }
        public string VisitType { get; set; }
        public string RunNumberType { get; set; }
        public bool ResetDaily { get; set; }
        public bool ResetMonthly { get; set; }
        public bool ResetYearly { get; set; }
        public string StartingLetter { get; set; }
        public string FormatInitialPart { get; set; }
        public string FormatSeparator { get; set; }
        public string FormatLastPart { get; set; }
        public bool UnderInsurance { get; set; }
        public int? ModifiedBy { get; set; }
        public DateTime? ModifiedOn { get; set; }
    }
}
