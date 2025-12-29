import {type Decimal} from "decimal.js";

export interface BalanceResponse {
    id: string;
    user_id: string;
    identifier: string;
    amount: Decimal;
    created_at: Date;
    updated_at: Date;
}

export interface BalanceDto {
    userId: string;
    balance: number;
    lastUpdated: string;
}
