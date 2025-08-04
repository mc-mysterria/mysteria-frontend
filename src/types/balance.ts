import { type UserDefaultSort } from "./base";
import { type Decimal } from "decimal.js";

export type BalanceSort = UserDefaultSort | "amount";

export interface BalanceUpdate {
  amount?: Decimal;
}

export interface BalanceResponse {
  id: string;
  user_id: string;
  identifier: string;
  amount: Decimal;
  created_at: Date;
  updated_at: Date;
}

export interface BalanceFilterParams {
  user_id?: string;
  identifier?: string;
  min_amount?: Decimal;
  max_amount?: Decimal;
}

export interface UserTotalBalanceResponse {
  total: Decimal;
  balances: BalanceResponse[];
}

// New API balance DTO
export interface BalanceDto {
  userId: string;
  balance: number;
  lastUpdated: string;
}
