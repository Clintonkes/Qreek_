export const PAYMENT_PROVIDER = {
  name: 'Flutterwave',
  checkoutLabel: 'Flutterwave secure checkout',
};

export const QREEK_FEES = {
  poolContribution: 0.0015,
  poolPayout: 0.0015,
  paymentLink: 0.0021,
  payroll: 0.0021,
};

export const feePercent = (rate) => `${(rate * 100).toFixed(2)}%`;

export const calculateFee = (amount, rate) => {
  const value = Number(amount || 0);
  if (!Number.isFinite(value) || value <= 0) return 0;
  return +(value * rate).toFixed(2);
};

export const calculateNet = (amount, rate) => {
  const value = Number(amount || 0);
  if (!Number.isFinite(value) || value <= 0) return 0;
  return +(value - calculateFee(value, rate)).toFixed(2);
};

export const getCheckoutUrl = (payload) => (
  payload?.checkout_url ||
  payload?.payment_url ||
  payload?.link ||
  payload?.data?.checkout_url ||
  payload?.data?.payment_url ||
  payload?.data?.link ||
  payload?.data?.hosted_link ||
  payload?.flutterwave?.link ||
  payload?.flutterwave?.data?.link ||
  ''
);

export const getTransactionReference = (payload) => (
  payload?.reference ||
  payload?.tx_ref ||
  payload?.data?.reference ||
  payload?.data?.tx_ref ||
  payload?.flutterwave?.tx_ref ||
  ''
);
