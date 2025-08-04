import { BaseCRUD } from "./base";
import type {
  PunishmentResponse,
  PunishmentCreate,
  PunishmentUpdate,
  PunishmentFilterParams,
} from "@/types/punishments";

export class PunishmentsAPI extends BaseCRUD<
  PunishmentResponse,
  PunishmentCreate,
  PunishmentUpdate,
  PunishmentFilterParams
> {
  constructor() {
    super("/admin/punishments");
  }
}

export const punishmentsAPI = new PunishmentsAPI();
