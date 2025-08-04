export interface Magic {
  pathway: string;
  translatedPathway: string;
  sequence: number;
}

export type Pathways = Record<string, number>;

export interface CatwalkSuccessResponse {
  success: true;
  message: string;
  data: {
    pathways: Pathways;
  };
  statusCode: 200;
}

export interface CatwalkErrorResponse {
  success: false;
  message: string;
  statusCode: number;
}

export type CatwalkAPIResponse = CatwalkSuccessResponse | CatwalkErrorResponse;

export interface ServerInfo {
  name: string;
  health: {
    cpus: number;
    uptime: number;
    totalMemory: number;
    maxMemory: number;
    freeMemory: number;
  };
  motd: string;
  version: string;
  tps: string;
  bukkitVersion: string;
  maxPlayers: number;
  onlinePlayers: number;
}

export interface PlayerInfo {
  balance: number;
  expLevel: number;
  uuid: string;
  displayName: string;
  address?: string;
  port?: number;
  exhaustion: number;
  exp: number;
  whitelisted: boolean;
  banned: boolean;
  op: boolean;
  location: number[];
  dimension: string;
  health: number;
  hunger: number;
  saturation: number;
  gamemode: string;
  lastPlayed: number;
}

export interface OfflinePlayer {
  balance: number;
  uuid: string;
  displayName: string;
  whitelisted: boolean;
  banned: boolean;
  op: boolean;
  lastPlayed: number;
}

export interface ServerStats {
  summary: {
    totalPlayers: number;
    averagePlaytime: number;
    peakOnline: number;
    uptimeHours: number;
  };
}

export interface ParsedValue {
  source: string;
  parsedValue: number;
}

export interface StatsSummaryData {
  totalPlayers: number;
  onlinePlayers: number;
  newPlayers: number;
  tps: string;
  avgPlaytime: number;
}

export interface StatsSummaryResponse {
  success: boolean;
  message: string;
  data: {
    summary: StatsSummaryData;
  };
}

export interface StatsSummary {
  totalPlayers: number;
  onlinePlayers: number;
  newPlayers: number;
  tps: number | string;
  avgPlaytime: number;
}

export interface OnlineHistoryEntry {
  timestamp: string;
  online: number;
}

export interface OnlineHistory {
  players: OnlineHistoryEntry[];
}

export interface TopPlayer {
  uuid: string;
  displayName: string;
  playtime: number;
}

export interface HourlyDistribution {
  hourly_distribution: Record<string, number>;
}

export interface OnlinePlayersData {
  players: Array<{
    timestamp: string;
    count: number;
    players: string[];
  }>;
  hourly_distribution: Record<string, number>;
}

export interface PunishmentData {
  type: "ban" | "kick" | "warn" | "mute";
  reason: string;
  duration?: number;
  permanent?: boolean;
}

export interface ModerationAction {
  playerUuid: string;
  punishment: PunishmentData;
  moderatorUuid: string;
  timestamp: number;
}
