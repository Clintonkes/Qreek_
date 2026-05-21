# Flutterwave Integration Plan

This frontend is now prepared to use Flutterwave for payment links, pool payouts, and payroll execution. The backend must own all secret-key calls, verification, ledger updates, and fee settlement.

## Required Accounts And Keys

- Flutterwave merchant account for Qreek.
- Live and test API keys:
  - `FLW_PUBLIC_KEY`
  - `FLW_SECRET_KEY`
  - `FLW_SECRET_HASH` for webhook signature checks.
- Settlement bank/subaccount setup for recipients that should receive net settlement directly.
- Qreek revenue settlement destination. In a Flutterwave split, this is usually the main merchant balance while recipient subaccounts receive their portion.
- Public frontend URL for redirects, for example `https://qreek.example.com`.
- Backend webhook URL, for example `https://api.qreek.example.com/api/v1/payments/flutterwave/webhook`.

## Fee Rules

Qreek’s product fee is separate from Flutterwave processing fees:

| Action | Qreek fee | Deduction point | Qreek revenue destination |
| --- | ---: | --- | --- |
| Pool contribution | 0.15% | From gross amount before recipient/pool credit | Qreek Flutterwave merchant balance |
| Pool payout | 0.15% | From gross payout before recipient receives net | Qreek Flutterwave merchant balance |
| Payment link | 0.21% | From gross payer amount before creator receives net | Qreek Flutterwave merchant balance |
| Payroll | 0.21% | From each salary gross before employee receives net | Qreek Flutterwave merchant balance |

Formula:

```txt
qreek_fee = round(gross_amount * fee_rate, 2)
recipient_net = gross_amount - qreek_fee
```

Store these values on every transaction:

```txt
gross_amount
qreek_fee
provider_fee
net_amount
provider
provider_reference / tx_ref
provider_transaction_id
status
settlement_account or subaccount_id
```

Flutterwave processing fees should be recorded separately as `provider_fee`. Do not mix them with `qreek_fee`, because Qreek revenue and Flutterwave costs answer different accounting questions.

## How Charges Should Move

For collections, create a Flutterwave Standard checkout transaction from the backend. Include a unique `tx_ref`, payer metadata, amount, currency, redirect URL, and the split/subaccount instruction when recipients settle directly.

Best settlement model:

```txt
payer pays gross_amount
Flutterwave deducts provider_fee according to the merchant pricing agreement
Flutterwave split sends recipient_net to recipient subaccount/settlement destination
Qreek fee remains in Qreek merchant balance or Qreek revenue subaccount
backend records gross, qreek_fee, provider_fee, and net
```

For payouts and payroll, the backend should debit the source balance or funding account, calculate Qreek’s fee per entry, then initiate Flutterwave transfers for `net_amount`. The fee remains as Qreek revenue in the ledger and should be reconciled against Flutterwave balance/settlement reports.

## Backend Endpoints Expected By This Frontend

### Payment link checkout

`POST /api/v1/payment-links/pay/:code`

Request:

```json
{
  "name": "Ada Okafor",
  "phone": "+2348012345678",
  "amount": 5000,
  "note": "January dues",
  "provider": "flutterwave",
  "redirect_url": "https://qreek.example.com/p/ABC123"
}
```

Response must include one of:

```json
{
  "checkout_url": "https://checkout.flutterwave.com/v3/hosted/pay/...",
  "tx_ref": "qreek_link_ABC123_..."
}
```

The frontend redirects the payer to `checkout_url`.

### Payment link confirmation

`POST /api/v1/payment-links/pay/:code/flutterwave/confirm`

Request:

```json
{
  "transaction_id": "123456789",
  "tx_ref": "qreek_link_ABC123_...",
  "status": "successful"
}
```

Backend action:

1. Verify the transaction with Flutterwave using the secret key.
2. Match `tx_ref` to the pending Qreek transaction.
3. Confirm amount and currency exactly.
4. Confirm status is successful.
5. Mark the ledger transaction paid once, idempotently.
6. Return the verified payment record.

### Pool payout

`POST /api/v1/pools/:id/send`

The frontend now sends `provider: "flutterwave"` with amount, recipient bank details, note, and PIN. Backend should calculate `qreek_fee` and transfer only `net_amount`.

### Payroll

`POST /api/v1/payroll/runs`

The frontend sends `provider: "flutterwave"` so the preview uses Flutterwave-era fee rules.

`POST /api/v1/payroll/runs/:id/execute`

The frontend sends `provider: "flutterwave"` with the PIN. Backend should create one transfer per employee for `net_amount` and record each provider reference.

## Webhook Rules

- Receive Flutterwave webhooks on one backend endpoint.
- Reject requests whose `verif-hash` header does not match `FLW_SECRET_HASH`.
- Re-verify the transaction or transfer with Flutterwave before mutating Qreek records.
- Handle duplicate webhooks by using `tx_ref` and provider transaction ID as idempotency keys.
- Only mark Qreek records successful after provider status, amount, and currency all match.
- Store the raw webhook payload for audit/debugging.

## Frontend Files Changed

- `src/lib/payments.js`: provider name, Qreek fee rates, fee helpers, checkout URL extraction.
- `src/api/paymentLinks.js`: Flutterwave confirmation endpoint helper.
- `src/pages/PublicPayment.jsx`: real checkout redirect and confirmation flow.
- `src/pages/PaymentLinks.jsx`: payment-link fee disclosure and provider marker.
- `src/pages/PoolDetail.jsx`: shared fee helpers and provider marker for payouts.
- `src/pages/PayrollRunCreate.jsx`: provider marker for payroll preview and execution.
- `src/pages/Landing.jsx` and `index.html`: public copy updated from Monnify to Flutterwave.

## Verification Checklist

- Test payment link checkout with Flutterwave test keys.
- Confirm redirect returns with `transaction_id`, `tx_ref`, and `status`.
- Confirm backend verification rejects wrong amount, wrong currency, failed status, and duplicate confirmation.
- Confirm webhook signature rejection.
- Reconcile one full flow: gross amount, Qreek fee, Flutterwave fee, recipient net, and Qreek revenue settlement.
