export type StaffProfilePlatform = "discord" | "github";
export type StaffRank = "owner" | "developer" | "emissary" | "designer" | "tester";

export interface StaffMember {
  name: string;
  username: string;
  avatarUrl: string;
  profileUrl: string;
  platform: StaffProfilePlatform;
}

export interface StaffGroup {
  rank: StaffRank;
  members: StaffMember[];
}

const DISCORD_GUILD_ID = "1401234466122498048";

const discordProfile = (userId: string) => `https://discord.com/users/${userId}`;
const githubProfile = (username: string) => `https://github.com/${username}`;

const discordAvatar = (userId: string, avatarHash: string) =>
  `https://cdn.discordapp.com/avatars/${userId}/${avatarHash}.png?size=256`;

const discordGuildAvatar = (userId: string, avatarHash: string) =>
  `https://cdn.discordapp.com/guilds/${DISCORD_GUILD_ID}/users/${userId}/avatars/${avatarHash}.png?size=256`;

const discordDefaultAvatar = (index: number) => `https://cdn.discordapp.com/embed/avatars/${index}.png`;

// Staff roster grouped by displayed rank. To add a future staff member, add one
// object under the right rank with their display name, Discord username, avatar,
// and profile destination.
export const staffGroups: StaffGroup[] = [
  {
    rank: "owner",
    members: [
      {
        name: "ikeepca1m",
        username: "ikeepca1m",
        avatarUrl: discordAvatar("656201112604639273", "1bad0805006779c5f9f4967caabeec96"),
        profileUrl: githubProfile("ikeepcalm"),
        platform: "github",
      },
    ],
  },
  {
    rank: "developer",
    members: [
      {
        name: "Djecka1337",
        username: "djecka1337",
        avatarUrl: discordAvatar("343038454474604544", "3fd3b9a1987d85c8e8fc1248350d1dd2"),
        profileUrl: githubProfile("Djecka-2019"),
        platform: "github",
      },
      {
        name: "farmerjoe1",
        username: "farmerjoe6262",
        avatarUrl: discordAvatar("1125007439864008734", "b1685e8dc38fa071d7d19517eaf9a203"),
        profileUrl: githubProfile("farmerjoe121"),
        platform: "github",
      },
      {
        name: "IkeaBird132",
        username: "ikeabird1",
        avatarUrl: discordGuildAvatar("361153932044795905", "7e12d0a04aa0409130812cf20358d3e3"),
        profileUrl: githubProfile("IkeaBird123"),
        platform: "github",
      },
      {
        name: "Optuber",
        username: "optuber",
        avatarUrl: discordAvatar("1021067351506038886", "2d4b84870166ecd5362e2251ff38dd79"),
        profileUrl: githubProfile("Optuber01"),
        platform: "github",
      },
      {
        name: "Skyblade46558",
        username: "xcution41_13486",
        avatarUrl: discordAvatar("1207754939556831283", "9ec9dc6efa5d9a0104828ce53c9197e5"),
        profileUrl: githubProfile("Elser-bzra"),
        platform: "github",
      },
    ],
  },
  {
    rank: "emissary",
    members: [
      {
        name: "King_ju26",
        username: "king_julien26",
        avatarUrl: discordAvatar("708621685384937542", "9b87fb4d4068c8361149cff977e09ea5"),
        profileUrl: discordProfile("708621685384937542"),
        platform: "discord",
      },
      {
        name: "MintParkerFan",
        username: "curativeflame70",
        avatarUrl: discordGuildAvatar("932292149133860914", "c38252b207c7828f769080323c39715d"),
        profileUrl: discordProfile("932292149133860914"),
        platform: "discord",
      },
      {
        name: "NerdyGekko",
        username: "nerdygekko",
        avatarUrl: discordAvatar("229434150745145344", "3fc880330c56103165d229b4bd070f1b"),
        profileUrl: discordProfile("229434150745145344"),
        platform: "discord",
      },
    ],
  },
  {
    rank: "designer",
    members: [
      {
        name: "Adiantumdjb",
        username: "adiantum.djb",
        avatarUrl: discordAvatar("761005876886503435", "944d9eeb4f0c8f4d918d37695dd7ba96"),
        profileUrl: discordProfile("761005876886503435"),
        platform: "discord",
      },
      {
        name: "kudium",
        username: "kudium",
        avatarUrl: discordAvatar("988343195404492820", "a2091d15078539c00ed8659a03efa7f8"),
        profileUrl: discordProfile("988343195404492820"),
        platform: "discord",
      },
      {
        name: "Mykha10",
        username: "m1kha5",
        avatarUrl: discordDefaultAvatar(0),
        profileUrl: discordProfile("1241828895452303370"),
        platform: "discord",
      },
      {
        name: "SgtPriest",
        username: "_sgt__",
        avatarUrl: discordAvatar("361210742126411782", "3b2e7bcfdf1e6a9e6ca79600d2eaede2"),
        profileUrl: discordProfile("361210742126411782"),
        platform: "discord",
      },
      {
        name: "Sza_fka",
        username: "sza_fka.",
        avatarUrl: discordAvatar("690232041455091714", "1286c83742355461a2e439731f344af0"),
        profileUrl: discordProfile("690232041455091714"),
        platform: "discord",
      },
      {
        name: "Zaryn_Indrath",
        username: "zzaryn_",
        avatarUrl: discordAvatar("593292615152041994", "7eefda2523452138c09b4a266edc49d6"),
        profileUrl: discordProfile("593292615152041994"),
        platform: "discord",
      },
    ],
  },
  {
    rank: "tester",
    members: [
      {
        name: "Ciikoe",
        username: "ciikoe",
        avatarUrl: discordAvatar("434750424797675521", "2074b8d05470ec774cf65bd750caf0e7"),
        profileUrl: discordProfile("434750424797675521"),
        platform: "discord",
      },
      {
        name: "DjonMustard",
        username: "delicousriceeater",
        avatarUrl: discordAvatar("668988334420525056", "b0a264c8f26094bf05e949d016ca3e34"),
        profileUrl: discordProfile("668988334420525056"),
        platform: "discord",
      },
      {
        name: "EinLumian",
        username: "einlumian",
        avatarUrl: discordAvatar("834472314409844837", "18712c2c5b825525a09b6acdf8053199"),
        profileUrl: discordProfile("834472314409844837"),
        platform: "discord",
      },
      {
        name: "KratosLion",
        username: "sunkn0wn",
        avatarUrl: discordAvatar("245690933037891585", "f71719e9f2ad5840f24a08eec7dafd32"),
        profileUrl: discordProfile("245690933037891585"),
        platform: "discord",
      },
      {
        name: "RestingLoki",
        username: "sashimi0628",
        avatarUrl: discordAvatar("844948927848644610", "283a82c5657ea737228cdfea98f3b82f"),
        profileUrl: discordProfile("844948927848644610"),
        platform: "discord",
      },
      {
        name: "Sebusori",
        username: "sebusori",
        avatarUrl: discordAvatar("436854930494586880", "9feb966abccdb0df4da8bc3061211535"),
        profileUrl: discordProfile("436854930494586880"),
        platform: "discord",
      },
      {
        name: "Squareopolis",
        username: "thehipduke",
        avatarUrl: discordAvatar("243529897618702336", "672a81b65fa9949c8404f513038fbf56"),
        profileUrl: discordProfile("243529897618702336"),
        platform: "discord",
      },
      {
        name: "SquidIAT",
        username: "fish713",
        avatarUrl: discordAvatar("943706216352346143", "252026854e82ada836fd84bc4d08a739"),
        profileUrl: discordProfile("943706216352346143"),
        platform: "discord",
      },
      {
        name: "Worm_of_Gloom",
        username: "lesouth03",
        avatarUrl: discordAvatar("934244061618008084", "5c2ad177561a0245132c1b5f2913b5c1"),
        profileUrl: discordProfile("934244061618008084"),
        platform: "discord",
      },
    ],
  },
];
