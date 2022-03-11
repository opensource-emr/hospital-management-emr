using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DanpheEMR.ServerModel
{
    public class PrinterSettingsModel
    {
        [Key]
        public int PrinterSettingId { get; set; }
        public string PrintingType { get; set; }
        public string GroupName { get; set; }
        public string PrinterDisplayName { get; set; }
        public string PrinterName { get; set; }
        public string ModelName { get; set; }
        public int? Width_Lines { get; set; }
        public int? Height_Lines { get; set; }
        public int? HeaderGap_Lines { get; set; }
        public int? FooterGap_Lines { get; set; }
        public int? mh { get; set; }
        public int? ml { get; set; }
        public string ServerFolderPath { get; set; }
        public string Remarks { get; set; }
        public bool? IsActive { get; set; }
        public DateTime? CreatedOn { get; set; }
        public int? CreatedBy { get; set; }
        public DateTime? ModifiedOn { get; set; }
        public int? ModifiedBy { get; set; }
    }
}
