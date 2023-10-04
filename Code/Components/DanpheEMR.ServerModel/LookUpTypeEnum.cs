using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DanpheEMR.ServerModel
{
    public enum LookUpTypeEnum
    {
        [Description("Cases List")] Case = 1,

        [Description("Bitten Body Part List")] BodyPart = 2,

        [Description("Biting Snake List")] SnakeList = 3,

        [Description("First Aid List")] FirstAid = 4
    }
}
