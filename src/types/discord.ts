export interface DiscordUser {
  id: string;
  name: string;
  nick: string | null;
  display_name: string;
  discriminator: string;
  avatar: string | null;
}

export interface DiscordMemberResponse {
  id: string;
  name: string;
  nick: string | null;
  display_name: string | null;
  discriminator: string;
  avatar: string | null;
}

export interface DiscordUserResponse {
  id: string;
  username: string;
  avatar: string | null;
  discriminator: number;
  public_flags: number;
  flags: number;
  banner: string | null;
  accent_color: number | null;
  global_name: string | null;
  avatar_decoration_data: Record<string, unknown> | null;
  banner_color: string | null;
  clan: Record<string, unknown> | null;
  primary_guild: Record<string, unknown> | null;
  mfa_enabled: boolean;
  locale: string;
  premium_type: number;
  email: string | null;
}
