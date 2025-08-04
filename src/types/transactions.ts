import { type UserDefaultSort } from "./base";
import { type Decimal } from "decimal.js";
import { type ServiceResponse } from "./services";
import { type TimestampsMixin } from "./base";

export type TransactionType =
  | "deposit"
  | "withdrawal"
  | "transfer"
  | "purchase"
  | "donation"
  | "system"
  | "refund"
  | "adjustment";

export type JsonValue =
  | string
  | number
  | boolean
  | null
  | JsonValue[]
  | { [key: string]: JsonValue };

export interface TransactionMetadata {
  [key: string]: string | number | boolean | null | undefined;
}

export interface SystemTransactionMetadata extends TransactionMetadata {
  reason?: string;
  admin_id?: string;
  system_note?: string;
}

export interface TransactionCreate {
  amount?: Decimal;
  recipient_id?: string;
  type: TransactionType;
  description?: string;
  transaction_metadata?: JsonValue;
  user_id?: string;
  service_id?: string;
}

export interface TransactionBase {
  id: string;
  amount?: Decimal;
  recipient_id?: string;
  type: TransactionType;
  description?: string;
  transaction_metadata?: JsonValue;
  user_id?: string;
  service_id?: string;
}

export interface TransactionFilterParams {
  user_id?: string;
  recipient_id?: string;
  service_id?: string;
  type?: TransactionType;
  min_amount?: Decimal;
  max_amount?: Decimal;
  start_date?: Date;
  end_date?: Date;
}

export type TransactionSort = UserDefaultSort | "amount" | "type";

export interface DepositTransaction extends TransactionBase {
  type: "deposit";
}

export interface TransferTransaction extends TransactionBase {
  type: "transfer";
}

export interface PurchaseTransaction extends TransactionBase {
  type: "purchase";
  service_id: string;
}

export interface WithdrawalTransaction extends TransactionBase {
  type: "withdrawal";
}

export interface SystemDepositTransaction extends TransactionBase {
  type: "system";
  transaction_metadata?: JsonValue;
}

export interface RefundTransaction extends TransactionBase {
  type: "refund";
  original_transaction_id: string;
  reason: string;
}

export interface AdjustmentTransaction extends TransactionBase {
  type: "adjustment";
  reason: string;
}

export interface DonationTransaction extends TransactionBase {
  type: "donation";
  description: string;
  donor_name?: string;
  donor_email?: string;
  source?: string;
  original_currency?: string;
  original_amount?: Decimal;
}

export interface TransactionUpdate {
  amount?: Decimal;
  type?: TransactionType;
  description?: string;
  service_id?: string;
  transaction_metadata?: JsonValue;
}

export interface TransactionResponse extends TransactionBase, TimestampsMixin {
  recipient_id?: string;
  service_id?: string;
  service?: ServiceResponse;
  updated_at?: Date;
}
