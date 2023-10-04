export class LabSummaryDashboardVM {
    TotalTest: number = 0;
    TotalNegative: number = 0;
    TotalPositive: number = 0;
    TotalPendingTests: number = 0;
    TotalTestToday: number = 0;
    TotalNegativeToday: number = 0;
    TotalPositiveToday: number = 0;
    PendingTestsToday: number = 0;
}

export class labReqDetails {
    PositiveCount: number;
    NegativeCount: number;
    PendingCount: number;
    TotalCount: number;
    CancelledCountForNewPatient: number;
    ReturnCountForNewPatient: number;
    CompleteCountForNewPatient: number;
    PendingCountForNewPatient: number;
    TotalCountForNewPatient: number;
}

export class NormalAbnormalLabModel {
    JanCount: number;
    FebCount: number;
    MarCount: number;
    AprCount: number;
    MayCount: number;
    JunCount: number;
    JulCount: number;
    AugCount: number;
    SepCount: number;
    OctCount: number;
    NovCount: number;
    DecCount: number;
}