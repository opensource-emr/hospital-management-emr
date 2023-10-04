using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DanpheEMR.Core.Parameters
{
    public class LookupsModel
    {
        [Key]
        public int LookupId { get; set; }
        public string ModuleName { get; set; }
        public string LookupName { get; set; }
        public string LookupDataJson { get; set; }
        public string Description { get; set; }

    }
}
