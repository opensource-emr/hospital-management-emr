export class Currency_DTO {
  CurrencyId: number = null;
  CurrencyCode: string = "";
  CurrencyName: string = "";
  ExchangeRateDividend: number = 1; //! Krishna, 9thAug'23, Keeping this value 1 by default because this is a dividend value which cannot be 0, which may result in Mathematical error.
  ISbaseCurrency: boolean = false;
  IsActive: boolean = false;
}
