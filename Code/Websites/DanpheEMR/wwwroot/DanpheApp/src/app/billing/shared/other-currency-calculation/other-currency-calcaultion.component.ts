import { ChangeDetectorRef, Component, EventEmitter, Input, Output } from "@angular/core";
import { CoreService } from "../../../core/shared/core.service";
import { CommonFunctions } from "../../../shared/common.functions";
import { BillingMasterBlService } from "../billing-master.bl.service";
import { Currency_DTO } from "../dto/other-currency.dto";

@Component({
  selector: 'other-currency-calculation',
  templateUrl: './other-currency-calculation.component.html'
})
export class OtherCurrencyCalculationComponent {

  @Input('base-TotalAmount')
  public set baseTotalAmount(val: number) {
    let temp = val;
    if (temp != this.BaseTotalAmount) {
      this.BaseTotalAmount = temp;
      this.ConvertTotalAmountByCurrency();
    }
  }
  public BaseTotalAmount: number = 0;

  @Input('show-otherCurrencyCalculation')
  public ShowOtherCurrencyCalculation: boolean = false;

  @Output('otherCurrencyCalculation-Callback')
  public OtherCurrencyCalculationCallback: EventEmitter<object> = new EventEmitter<object>();

  public Currencies = new Array<Currency_DTO>();

  public selectedCurrency = new Currency_DTO();
  public ConvertedAmount: number = 0;
  public ExchangeRate: number = 0;
  public InvalidNumber: boolean = false;
  public OtherCurrencyDetail: OtherCurrencyDetail = { CurrencyCode: '', ExchangeRate: 0, BaseAmount: 0, ConvertedAmount: 0 };


  constructor(private _billingMasterBlService: BillingMasterBlService, public coreService: CoreService, private _changeDetector: ChangeDetectorRef) {
    this.Currencies = _billingMasterBlService.Currencies;
  }
  CurrencyChangedEvent($event): void {
    if ($event) {
      const currency = this.Currencies.find(a => a.CurrencyCode === $event.target.value);
      if (currency) {
        this.selectedCurrency = currency;
        this.ExchangeRate = this.selectedCurrency.ExchangeRateDividend;
        this.ConvertTotalAmountByCurrency();
      } else {
        this.EmitData(null);
      }
    } else {
      this.EmitData(null);
    }
  }
  ConvertTotalAmountByCurrency(): void {
    if (this.ExchangeRate <= 0) {
      this.InvalidNumber = true;
      this.ConvertedAmount = 0;
      this.EmitData(null);
      return;
    } else {
      this.InvalidNumber = false;
    }

    if (this.selectedCurrency && this.selectedCurrency.CurrencyCode && this.ExchangeRate > 0) {
      const convertedAmount = this.BaseTotalAmount / this.ExchangeRate;
      this.ConvertedAmount = CommonFunctions.parseAmount(convertedAmount, 4);
      this._changeDetector.detectChanges();
      this.PrepareOtherCurrencyDetailObject();
    } else {
      this.EmitData(null);
    }
  }

  PrepareOtherCurrencyDetailObject(): void {

    this.OtherCurrencyDetail.CurrencyCode = this.selectedCurrency.CurrencyCode,
      this.OtherCurrencyDetail.ExchangeRate = this.ExchangeRate,
      this.OtherCurrencyDetail.BaseAmount = this.BaseTotalAmount,
      this.OtherCurrencyDetail.ConvertedAmount = this.ConvertedAmount

    if (this.OtherCurrencyDetail && this.OtherCurrencyDetail.CurrencyCode) {
      this.EmitData(this.OtherCurrencyDetail);
    }
  }

  EmitData(data): void {
    this.OtherCurrencyCalculationCallback.emit(data);
  }
}
