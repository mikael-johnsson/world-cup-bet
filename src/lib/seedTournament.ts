import connectDB from "@/lib/db";
import { Tournament } from "@/models/Tournament";
import { TournamentType } from "@/types";

// 2026 World Cup teams and groups (realistic setup)
const TOURNAMENT_DATA: TournamentType = {
  year: 2026,
  groups: [
    {
      name: "Grupp A",
      teams: [
        { code: "USA", name: "United States" },
        { code: "MEX", name: "Mexico" },
        { code: "CAN", name: "Canada" },
        { code: "URU", name: "Uruguay" },
      ],
      fixtures: [
        {
          matchId: "A1",
          homeTeam: { code: "USA", name: "United States" },
          awayTeam: { code: "MEX", name: "Mexico" },
          matchDate: "2026-06-11T00:00:00.000Z",
          status: "pending" as const,
        },
        {
          matchId: "A2",
          homeTeam: { code: "CAN", name: "Canada" },
          awayTeam: { code: "URU", name: "Uruguay" },
          matchDate: "2026-06-11T00:00:00.000Z",
          status: "pending" as const,
        },
        {
          matchId: "A3",
          homeTeam: { code: "USA", name: "United States" },
          awayTeam: { code: "CAN", name: "Canada" },
          matchDate: "2026-06-11T00:00:00.000Z",
          status: "pending" as const,
        },
        {
          matchId: "A4",
          homeTeam: { code: "URU", name: "Uruguay" },
          awayTeam: { code: "MEX", name: "Mexico" },
          matchDate: "2026-06-11T00:00:00.000Z",
          status: "pending" as const,
        },
        {
          matchId: "A5",
          homeTeam: { code: "MEX", name: "Mexico" },
          awayTeam: { code: "CAN", name: "Canada" },
          matchDate: "2026-06-11T00:00:00.000Z",
          status: "pending" as const,
        },
        {
          matchId: "A6",
          homeTeam: { code: "URU", name: "Uruguay" },
          awayTeam: { code: "USA", name: "United States" },
          matchDate: "2026-06-11T00:00:00.000Z",
          status: "pending" as const,
        },
      ],
    },
    {
      name: "Grupp B",
      teams: [
        { code: "ENG", name: "England" },
        { code: "NED", name: "Netherlands" },
        { code: "SEN", name: "Senegal" },
        { code: "IRN", name: "Iran" },
      ],
      fixtures: [
        {
          matchId: "B1",
          homeTeam: { code: "ENG", name: "England" },
          awayTeam: { code: "IRN", name: "Iran" },
          matchDate: "2026-06-11T00:00:00.000Z",
          status: "pending" as const,
        },
        {
          matchId: "B2",
          homeTeam: { code: "NED", name: "Netherlands" },
          awayTeam: { code: "SEN", name: "Senegal" },
          matchDate: "2026-06-11T00:00:00.000Z",
          status: "pending" as const,
        },
        {
          matchId: "B3",
          homeTeam: { code: "ENG", name: "England" },
          awayTeam: { code: "SEN", name: "Senegal" },
          matchDate: "2026-06-11T00:00:00.000Z",
          status: "pending" as const,
        },
        {
          matchId: "B4",
          homeTeam: { code: "IRN", name: "Iran" },
          awayTeam: { code: "NED", name: "Netherlands" },
          matchDate: "2026-06-11T00:00:00.000Z",
          status: "pending" as const,
        },
        {
          matchId: "B5",
          homeTeam: { code: "SEN", name: "Senegal" },
          awayTeam: { code: "ENG", name: "England" },
          matchDate: "2026-06-11T00:00:00.000Z",
          status: "pending" as const,
        },
        {
          matchId: "B6",
          homeTeam: { code: "IRN", name: "Iran" },
          awayTeam: { code: "NED", name: "Netherlands" },
          matchDate: "2026-06-11T00:00:00.000Z",
          status: "pending" as const,
        },
      ],
    },
    {
      name: "Grupp C",
      teams: [
        { code: "ARG", name: "Argentina" },
        { code: "FRA", name: "France" },
        { code: "PER", name: "Peru" },
        { code: "CHI", name: "Chile" },
      ],
      fixtures: [
        {
          matchId: "C1",
          homeTeam: { code: "ARG", name: "Argentina" },
          awayTeam: { code: "PER", name: "Peru" },
          matchDate: "2026-06-11T00:00:00.000Z",
          status: "pending" as const,
        },
        {
          matchId: "C2",
          homeTeam: { code: "FRA", name: "France" },
          awayTeam: { code: "CHI", name: "Chile" },
          matchDate: "2026-06-11T00:00:00.000Z",
          status: "pending" as const,
        },
        {
          matchId: "C3",
          homeTeam: { code: "ARG", name: "Argentina" },
          awayTeam: { code: "CHI", name: "Chile" },
          matchDate: "2026-06-11T00:00:00.000Z",
          status: "pending" as const,
        },
        {
          matchId: "C4",
          homeTeam: { code: "PER", name: "Peru" },
          awayTeam: { code: "FRA", name: "France" },
          matchDate: "2026-06-11T00:00:00.000Z",
          status: "pending" as const,
        },
        {
          matchId: "C5",
          homeTeam: { code: "CHI", name: "Chile" },
          awayTeam: { code: "ARG", name: "Argentina" },
          matchDate: "2026-06-11T00:00:00.000Z",
          status: "pending" as const,
        },
        {
          matchId: "C6",
          homeTeam: { code: "FRA", name: "France" },
          awayTeam: { code: "PER", name: "Peru" },
          matchDate: "2026-06-11T00:00:00.000Z",
          status: "pending" as const,
        },
      ],
    },
    {
      name: "Grupp D",
      teams: [
        { code: "BRA", name: "Brazil" },
        { code: "ESP", name: "Spain" },
        { code: "CRO", name: "Croatia" },
        { code: "KOS", name: "Kosovo" },
      ],
      fixtures: [
        {
          matchId: "D1",
          homeTeam: { code: "BRA", name: "Brazil" },
          awayTeam: { code: "CRO", name: "Croatia" },
          matchDate: "2026-06-11T00:00:00.000Z",
          status: "pending" as const,
        },
        {
          matchId: "D2",
          homeTeam: { code: "ESP", name: "Spain" },
          awayTeam: { code: "KOS", name: "Kosovo" },
          matchDate: "2026-06-11T00:00:00.000Z",
          status: "pending" as const,
        },
        {
          matchId: "D3",
          homeTeam: { code: "BRA", name: "Brazil" },
          awayTeam: { code: "KOS", name: "Kosovo" },
          matchDate: "2026-06-11T00:00:00.000Z",
          status: "pending" as const,
        },
        {
          matchId: "D4",
          homeTeam: { code: "CRO", name: "Croatia" },
          awayTeam: { code: "ESP", name: "Spain" },
          matchDate: "2026-06-11T00:00:00.000Z",
          status: "pending" as const,
        },
        {
          matchId: "D5",
          homeTeam: { code: "KOS", name: "Kosovo" },
          awayTeam: { code: "BRA", name: "Brazil" },
          matchDate: "2026-06-11T00:00:00.000Z",
          status: "pending" as const,
        },
        {
          matchId: "D6",
          homeTeam: { code: "ESP", name: "Spain" },
          awayTeam: { code: "CRO", name: "Croatia" },
          matchDate: "2026-06-11T00:00:00.000Z",
          status: "pending" as const,
        },
      ],
    },
    {
      name: "Grupp E",
      teams: [
        { code: "GER", name: "Germany" },
        { code: "BEL", name: "Belgium" },
        { code: "CZE", name: "Czech Republic" },
        { code: "ALB", name: "Albania" },
      ],
      fixtures: [
        {
          matchId: "E1",
          homeTeam: { code: "GER", name: "Germany" },
          awayTeam: { code: "CZE", name: "Czech Republic" },
          matchDate: "2026-06-11T00:00:00.000Z",
          status: "pending" as const,
        },
        {
          matchId: "E2",
          homeTeam: { code: "BEL", name: "Belgium" },
          awayTeam: { code: "ALB", name: "Albania" },
          matchDate: "2026-06-11T00:00:00.000Z",
          status: "pending" as const,
        },
        {
          matchId: "E3",
          homeTeam: { code: "GER", name: "Germany" },
          awayTeam: { code: "ALB", name: "Albania" },
          matchDate: "2026-06-11T00:00:00.000Z",
          status: "pending" as const,
        },
        {
          matchId: "E4",
          homeTeam: { code: "CZE", name: "Czech Republic" },
          awayTeam: { code: "BEL", name: "Belgium" },
          matchDate: "2026-06-11T00:00:00.000Z",
          status: "pending" as const,
        },
        {
          matchId: "E5",
          homeTeam: { code: "ALB", name: "Albania" },
          awayTeam: { code: "GER", name: "Germany" },
          matchDate: "2026-06-11T00:00:00.000Z",
          status: "pending" as const,
        },
        {
          matchId: "E6",
          homeTeam: { code: "BEL", name: "Belgium" },
          awayTeam: { code: "CZE", name: "Czech Republic" },
          matchDate: "2026-06-11T00:00:00.000Z",
          status: "pending" as const,
        },
      ],
    },
    {
      name: "Grupp F",
      teams: [
        { code: "ITA", name: "Italy" },
        { code: "POR", name: "Portugal" },
        { code: "POL", name: "Poland" },
        { code: "SVN", name: "Slovenia" },
      ],
      fixtures: [
        {
          matchId: "F1",
          homeTeam: { code: "ITA", name: "Italy" },
          awayTeam: { code: "POL", name: "Poland" },
          matchDate: "2026-06-11T00:00:00.000Z",
          status: "pending" as const,
        },
        {
          matchId: "F2",
          homeTeam: { code: "POR", name: "Portugal" },
          awayTeam: { code: "SVN", name: "Slovenia" },
          matchDate: "2026-06-11T00:00:00.000Z",
          status: "pending" as const,
        },
        {
          matchId: "F3",
          homeTeam: { code: "ITA", name: "Italy" },
          awayTeam: { code: "SVN", name: "Slovenia" },
          matchDate: "2026-06-11T00:00:00.000Z",
          status: "pending" as const,
        },
        {
          matchId: "F4",
          homeTeam: { code: "POL", name: "Poland" },
          awayTeam: { code: "POR", name: "Portugal" },
          matchDate: "2026-06-11T00:00:00.000Z",
          status: "pending" as const,
        },
        {
          matchId: "F5",
          homeTeam: { code: "SVN", name: "Slovenia" },
          awayTeam: { code: "ITA", name: "Italy" },
          matchDate: "2026-06-11T00:00:00.000Z",
          status: "pending" as const,
        },
        {
          matchId: "F6",
          homeTeam: { code: "POR", name: "Portugal" },
          awayTeam: { code: "POL", name: "Poland" },
          matchDate: "2026-06-11T00:00:00.000Z",
          status: "pending" as const,
        },
      ],
    },
    {
      name: "Grupp G",
      teams: [
        { code: "JPN", name: "Japan" },
        { code: "AUS", name: "Australia" },
        { code: "SRB", name: "Serbia" },
        { code: "ZMB", name: "Zambia" },
      ],
      fixtures: [
        {
          matchId: "G1",
          homeTeam: { code: "JPN", name: "Japan" },
          awayTeam: { code: "ZMB", name: "Zambia" },
          matchDate: "2026-06-11T00:00:00.000Z",
          status: "pending" as const,
        },
        {
          matchId: "G2",
          homeTeam: { code: "AUS", name: "Australia" },
          awayTeam: { code: "SRB", name: "Serbia" },
          matchDate: "2026-06-11T00:00:00.000Z",
          status: "pending" as const,
        },
        {
          matchId: "G3",
          homeTeam: { code: "JPN", name: "Japan" },
          awayTeam: { code: "SRB", name: "Serbia" },
          matchDate: "2026-06-11T00:00:00.000Z",
          status: "pending" as const,
        },
        {
          matchId: "G4",
          homeTeam: { code: "ZMB", name: "Zambia" },
          awayTeam: { code: "AUS", name: "Australia" },
          matchDate: "2026-06-11T00:00:00.000Z",
          status: "pending" as const,
        },
        {
          matchId: "G5",
          homeTeam: { code: "SRB", name: "Serbia" },
          awayTeam: { code: "JPN", name: "Japan" },
          matchDate: "2026-06-11T00:00:00.000Z",
          status: "pending" as const,
        },
        {
          matchId: "G6",
          homeTeam: { code: "AUS", name: "Australia" },
          awayTeam: { code: "ZMB", name: "Zambia" },
          matchDate: "2026-06-11T00:00:00.000Z",
          status: "pending" as const,
        },
      ],
    },
    {
      name: "Grupp H",
      teams: [
        { code: "MAR", name: "Morocco" },
        { code: "NOR", name: "Norway" },
        { code: "SVK", name: "Slovakia" },
        { code: "BIH", name: "Bosnia" },
      ],
      fixtures: [
        {
          matchId: "H1",
          homeTeam: { code: "MAR", name: "Morocco" },
          awayTeam: { code: "BIH", name: "Bosnia" },
          matchDate: "2026-06-11T00:00:00.000Z",
          status: "pending" as const,
        },
        {
          matchId: "H2",
          homeTeam: { code: "NOR", name: "Norway" },
          awayTeam: { code: "SVK", name: "Slovakia" },
          matchDate: "2026-06-11T00:00:00.000Z",
          status: "pending" as const,
        },
        {
          matchId: "H3",
          homeTeam: { code: "MAR", name: "Morocco" },
          awayTeam: { code: "SVK", name: "Slovakia" },
          matchDate: "2026-06-11T00:00:00.000Z",
          status: "pending" as const,
        },
        {
          matchId: "H4",
          homeTeam: { code: "BIH", name: "Bosnia" },
          awayTeam: { code: "NOR", name: "Norway" },
          matchDate: "2026-06-11T00:00:00.000Z",
          status: "pending" as const,
        },
        {
          matchId: "H5",
          homeTeam: { code: "SVK", name: "Slovakia" },
          awayTeam: { code: "MAR", name: "Morocco" },
          matchDate: "2026-06-11T00:00:00.000Z",
          status: "pending" as const,
        },
        {
          matchId: "H6",
          homeTeam: { code: "NOR", name: "Norway" },
          awayTeam: { code: "BIH", name: "Bosnia" },
          matchDate: "2026-06-11T00:00:00.000Z",
          status: "pending" as const,
        },
      ],
    },
    {
      name: "Grupp I",
      teams: [
        { code: "ROU", name: "Romania" },
        { code: "UKR", name: "Ukraine" },
        { code: "ISL", name: "Iceland" },
        { code: "BOL", name: "Bolivia" },
      ],
      fixtures: [
        {
          matchId: "I1",
          homeTeam: { code: "ROU", name: "Romania" },
          awayTeam: { code: "BOL", name: "Bolivia" },
          matchDate: "2026-06-11T00:00:00.000Z",
          status: "pending" as const,
        },
        {
          matchId: "I2",
          homeTeam: { code: "UKR", name: "Ukraine" },
          awayTeam: { code: "ISL", name: "Iceland" },
          matchDate: "2026-06-11T00:00:00.000Z",
          status: "pending" as const,
        },
        {
          matchId: "I3",
          homeTeam: { code: "ROU", name: "Romania" },
          awayTeam: { code: "ISL", name: "Iceland" },
          matchDate: "2026-06-11T00:00:00.000Z",
          status: "pending" as const,
        },
        {
          matchId: "I4",
          homeTeam: { code: "BOL", name: "Bolivia" },
          awayTeam: { code: "UKR", name: "Ukraine" },
          matchDate: "2026-06-11T00:00:00.000Z",
          status: "pending" as const,
        },
        {
          matchId: "I5",
          homeTeam: { code: "ISL", name: "Iceland" },
          awayTeam: { code: "ROU", name: "Romania" },
          matchDate: "2026-06-11T00:00:00.000Z",
          status: "pending" as const,
        },
        {
          matchId: "I6",
          homeTeam: { code: "UKR", name: "Ukraine" },
          awayTeam: { code: "BOL", name: "Bolivia" },
          matchDate: "2026-06-11T00:00:00.000Z",
          status: "pending" as const,
        },
      ],
    },
    {
      name: "Grupp J",
      teams: [
        { code: "COL", name: "Colombia" },
        { code: "ECU", name: "Ecuador" },
        { code: "PAR", name: "Paraguay" },
        { code: "IRQ", name: "Iraq" },
      ],
      fixtures: [
        {
          matchId: "J1",
          homeTeam: { code: "COL", name: "Colombia" },
          awayTeam: { code: "IRQ", name: "Iraq" },
          matchDate: "2026-06-11T00:00:00.000Z",
          status: "pending" as const,
        },
        {
          matchId: "J2",
          homeTeam: { code: "ECU", name: "Ecuador" },
          awayTeam: { code: "PAR", name: "Paraguay" },
          matchDate: "2026-06-11T00:00:00.000Z",
          status: "pending" as const,
        },
        {
          matchId: "J3",
          homeTeam: { code: "COL", name: "Colombia" },
          awayTeam: { code: "PAR", name: "Paraguay" },
          matchDate: "2026-06-11T00:00:00.000Z",
          status: "pending" as const,
        },
        {
          matchId: "J4",
          homeTeam: { code: "IRQ", name: "Iraq" },
          awayTeam: { code: "ECU", name: "Ecuador" },
          matchDate: "2026-06-11T00:00:00.000Z",
          status: "pending" as const,
        },
        {
          matchId: "J5",
          homeTeam: { code: "PAR", name: "Paraguay" },
          awayTeam: { code: "COL", name: "Colombia" },
          matchDate: "2026-06-11T00:00:00.000Z",
          status: "pending" as const,
        },
        {
          matchId: "J6",
          homeTeam: { code: "ECU", name: "Ecuador" },
          awayTeam: { code: "IRQ", name: "Iraq" },
          matchDate: "2026-06-11T00:00:00.000Z",
          status: "pending" as const,
        },
      ],
    },
    {
      name: "Grupp K",
      teams: [
        { code: "KOR", name: "South Korea" },
        { code: "TUN", name: "Tunisia" },
        { code: "TAI", name: "Thailand" },
        { code: "GUA", name: "Guatemala" },
      ],
      fixtures: [
        {
          matchId: "K1",
          homeTeam: { code: "KOR", name: "South Korea" },
          awayTeam: { code: "TAI", name: "Thailand" },
          matchDate: "2026-06-11T00:00:00.000Z",
          status: "pending" as const,
        },
        {
          matchId: "K2",
          homeTeam: { code: "TUN", name: "Tunisia" },
          awayTeam: { code: "GUA", name: "Guatemala" },
          matchDate: "2026-06-11T00:00:00.000Z",
          status: "pending" as const,
        },
        {
          matchId: "K3",
          homeTeam: { code: "KOR", name: "South Korea" },
          awayTeam: { code: "GUA", name: "Guatemala" },
          matchDate: "2026-06-11T00:00:00.000Z",
          status: "pending" as const,
        },
        {
          matchId: "K4",
          homeTeam: { code: "TAI", name: "Thailand" },
          awayTeam: { code: "TUN", name: "Tunisia" },
          matchDate: "2026-06-11T00:00:00.000Z",
          status: "pending" as const,
        },
        {
          matchId: "K5",
          homeTeam: { code: "GUA", name: "Guatemala" },
          awayTeam: { code: "KOR", name: "South Korea" },
          matchDate: "2026-06-11T00:00:00.000Z",
          status: "pending" as const,
        },
        {
          matchId: "K6",
          homeTeam: { code: "TUN", name: "Tunisia" },
          awayTeam: { code: "TAI", name: "Thailand" },
          matchDate: "2026-06-11T00:00:00.000Z",
          status: "pending" as const,
        },
      ],
    },
    {
      name: "Grupp L",
      teams: [
        { code: "CIV", name: "Côte d'Ivoire" },
        { code: "EGY", name: "Egypt" },
        { code: "GHA", name: "Ghana" },
        { code: "VIE", name: "Vietnam" },
      ],
      fixtures: [
        {
          matchId: "L1",
          homeTeam: { code: "CIV", name: "Côte d'Ivoire" },
          awayTeam: { code: "VIE", name: "Vietnam" },
          matchDate: "2026-06-11T00:00:00.000Z",
          status: "pending" as const,
        },
        {
          matchId: "L2",
          homeTeam: { code: "EGY", name: "Egypt" },
          awayTeam: { code: "GHA", name: "Ghana" },
          matchDate: "2026-06-11T00:00:00.000Z",
          status: "pending" as const,
        },
        {
          matchId: "L3",
          homeTeam: { code: "CIV", name: "Côte d'Ivoire" },
          awayTeam: { code: "GHA", name: "Ghana" },
          matchDate: "2026-06-11T00:00:00.000Z",
          status: "pending" as const,
        },
        {
          matchId: "L4",
          homeTeam: { code: "VIE", name: "Vietnam" },
          awayTeam: { code: "EGY", name: "Egypt" },
          matchDate: "2026-06-11T00:00:00.000Z",
          status: "pending" as const,
        },
        {
          matchId: "L5",
          homeTeam: { code: "GHA", name: "Ghana" },
          awayTeam: { code: "CIV", name: "Côte d'Ivoire" },
          matchDate: "2026-06-11T00:00:00.000Z",
          status: "pending" as const,
        },
        {
          matchId: "L6",
          homeTeam: { code: "EGY", name: "Egypt" },
          awayTeam: { code: "VIE", name: "Vietnam" },
          matchDate: "2026-06-11T00:00:00.000Z",
          status: "pending" as const,
        },
      ],
    },
  ],
  knockout: {
    roundOf16: [],
    quarterfinals: [],
    semifinals: [],
    final: [],
    champion: "",
    bronze: "",
  },
};

/**
 * Creates the 2026 World Cup tournament in the database if it doesn't already exist.
 * @returns The created tournament document or the existing one if it already exists.
 * @throws Error if there is an issue connecting to the database or creating the tournament.
 */
export async function seedTournament() {
  try {
    await connectDB();

    // Check if tournament already exists
    const existing = await Tournament.findOne({ year: 2026 });
    if (existing) {
      console.log("Tournament 2026 already exists");
      return existing;
    }

    const tournament = await Tournament.create(TOURNAMENT_DATA);
    console.log("Tournament seeded successfully:", tournament._id);
    return tournament;
  } catch (error) {
    console.error("Error seeding tournament:", error);
    throw error;
  }
}
