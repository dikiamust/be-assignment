import { createPaymentAccount } from './create.response';

export const paymentAccountList = {
  totalDatas: 1,
  page: 1,
  limit: 10,
  totalPages: 1,
  data: [createPaymentAccount],
};
