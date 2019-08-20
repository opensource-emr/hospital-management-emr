using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DanpheEMR.Core.Parameters
{


    public class ParameterModel
    {
        [Key]
        public int ParameterId { get; set; }
        public string ParameterGroupName { get; set; }
        public string ParameterName { get; set; }
        public string ParameterValue { get; set; }
        public string ValueDataType { get; set; }
        public string Description { get; set; }

    }
}
