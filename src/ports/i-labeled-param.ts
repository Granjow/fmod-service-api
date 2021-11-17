export interface ILabeledParam<TLabel extends string> {
    setLabel( label: TLabel ): Promise<void>;
}
