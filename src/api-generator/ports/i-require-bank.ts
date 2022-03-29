export interface IRequireBank {
    ensureBankLoaded( bankName: string ): Promise<void>;
}
