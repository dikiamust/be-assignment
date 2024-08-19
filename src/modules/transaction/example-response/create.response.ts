const transaction = {
  id: 1,
  senderPaymentAccountId: 1,
  recipientPaymentAccountId: 2,
  amount: 1000,
  currency: 'USD',
  externalRecipient: null,
  status: 'COMPLETED',
  createdAt: '2024-08-19T14:34:10.965Z',
  updatedAt: '2024-08-19T14:34:40.983Z',
};

export const createTopupTransaction = {
  ...transaction,
  type: 'TOPUP',
};

export const createSenMoneyTransaction = {
  ...transaction,
  type: 'SEND',
};

export const createWithdrawTransaction = {
  ...transaction,
  type: 'WITHDRAW',
};
