import { DischargeSummary } from "../../../../../src/app/adt/shared/discharge-summary.model";

export class DischargeSummaryConsultantViewModel {
    public dischargeSummaryId: number = 0;
    public consultantName: string;
    public consultantId: number = 0;
    public consultantNMC: string;
    public consultantLongSignature: string;
    public consultantSignImgPath: string;
    public consultantDepartmentName: string;
}