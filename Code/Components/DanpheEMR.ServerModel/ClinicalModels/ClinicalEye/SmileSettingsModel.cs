using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DanpheEMR.ServerModel
{
    public class SMILESSettingsModel
    {
        [Key]
        public int Id { get; set; }
        public int MasterId { get; set; }
        public string SpotDistanceLent { get; set; }
        public string SpotDistanceLentSide { get; set; }
        public string SpotDistanceCap { get; set; }
        public string SpotDistanceCapSide { get; set; }
        public string TrackDistanceLent { get; set; }
        public string TrackDistanceLentSide { get; set; }
        public string TrackDistanceCap { get; set; }
        public string TrackDistanceCapSide { get; set; }
        public string EnergyOffsetLent { get; set; }
        public string EnergyOffsetLentSide { get; set; }
        public string EnergyOffsetCap { get; set; }
        public string EnergyOffsetCapSide { get; set; }
        public string ScanDirectionLent { get; set; }
        public string ScanDirectionLentSide { get; set; }
        public string ScanDirectionCap { get; set; }
        public string ScanDirectionCapSide { get; set; }
        public string ScanModeLent { get; set; }
        public string ScanModeLentSide { get; set; }
        public string ScanModeCap { get; set; }
        public string ScanModeCapSide { get; set; }
        public string MinThicknessLent { get; set; }
        public string MinThicknessLentSide { get; set; }
        public string MinThicknessCap { get; set; }
        public string MinThicknessCapSide { get; set; }
        public string SidecutLent { get; set; }
        public string SidecutLentSide { get; set; }
        public string SidecutCap { get; set; }
        public string SidecutCapSide { get; set; }
        public int CreatedBy { get; set; }
        public DateTime CreatedOn { get; set; }
        public Boolean IsOD { get; set; }

    }
}


