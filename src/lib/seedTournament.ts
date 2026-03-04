import connectDB from "@/lib/db";
import { Tournament } from "@/models/Tournament";
import { TournamentType } from "@/types";

// 2026 World Cup teams and groups (realistic setup)
const TOURNAMENT_DATA: TournamentType = {
  year: 2026,
  groups: [
    {
      name: "Group A",
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
          matchDate: "T00:00:00.000Z",
          status: "pending" as const,
        },
        {
          matchId: "A2",
          homeTeam: { code: "CAN", name: "Canada" },
          awayTeam: { code: "URU", name: "Uruguay" },
          matchDate: "T00:00:00.000Z",
          status: "pending" as const,
        },
        {
          matchId: "A3",
          homeTeam: { code: "USA", name: "United States" },
          awayTeam: { code: "CAN", name: "Canada" },
          matchDate: "T00:00:00.000Z",
          status: "pending" as const,
        },
        {
          matchId: "A4",
          homeTeam: { code: "URU", name: "Uruguay" },
          awayTeam: { code: "MEX", name: "Mexico" },
          matchDate: "T00:00:00.000Z",
          status: "pending" as const,
        },
        {
          matchId: "A5",
          homeTeam: { code: "MEX", name: "Mexico" },
          awayTeam: { code: "CAN", name: "Canada" },
          matchDate: "T00:00:00.000Z",
          status: "pending" as const,
        },
        {
          matchId: "A6",
          homeTeam: { code: "URU", name: "Uruguay" },
          awayTeam: { code: "USA", name: "United States" },
          matchDate: "T00:00:00.000Z",
          status: "pending" as const,
        },
      ],
    },
    {
      name: "Group B",
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
          matchDate: "T00:00:00.000Z",
          status: "pending" as const,
        },
        {
          matchId: "B2",
          homeTeam: { code: "NED", name: "Netherlands" },
          awayTeam: { code: "SEN", name: "Senegal" },
          matchDate: "T00:00:00.000Z",
          status: "pending" as const,
        },
        {
          matchId: "B3",
          homeTeam: { code: "ENG", name: "England" },
          awayTeam: { code: "SEN", name: "Senegal" },
          matchDate: "T00:00:00.000Z",
          status: "pending" as const,
        },
        {
          matchId: "B4",
          homeTeam: { code: "IRN", name: "Iran" },
          awayTeam: { code: "NED", name: "Netherlands" },
          matchDate: "T00:00:00.000Z",
          status: "pending" as const,
        },
        {
          matchId: "B5",
          homeTeam: { code: "SEN", name: "Senegal" },
          awayTeam: { code: "ENG", name: "England" },
          matchDate: "T00:00:00.000Z",
          status: "pending" as const,
        },
        {
          matchId: "B6",
          homeTeam: { code: "IRN", name: "Iran" },
          awayTeam: { code: "NED", name: "Netherlands" },
          matchDate: "T00:00:00.000Z",
          status: "pending" as const,
        },
      ],
    },
    {
      name: "Group C",
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
          matchDate: "T00:00:00.000Z",
          status: "pending" as const,
        },
        {
          matchId: "C2",
          homeTeam: { code: "FRA", name: "France" },
          awayTeam: { code: "CHI", name: "Chile" },
          matchDate: "T00:00:00.000Z",
          status: "pending" as const,
        },
        {
          matchId: "C3",
          homeTeam: { code: "ARG", name: "Argentina" },
          awayTeam: { code: "CHI", name: "Chile" },
          matchDate: "T00:00:00.000Z",
          status: "pending" as const,
        },
        {
          matchId: "C4",
          homeTeam: { code: "PER", name: "Peru" },
          awayTeam: { code: "FRA", name: "France" },
          matchDate: "T00:00:00.000Z",
          status: "pending" as const,
        },
        {
          matchId: "C5",
          homeTeam: { code: "CHI", name: "Chile" },
          awayTeam: { code: "ARG", name: "Argentina" },
          matchDate: "T00:00:00.000Z",
          status: "pending" as const,
        },
        {
          matchId: "C6",
          homeTeam: { code: "FRA", name: "France" },
          awayTeam: { code: "PER", name: "Peru" },
          matchDate: "T00:00:00.000Z",
          status: "pending" as const,
        },
      ],
    },
    {
      name: "Group D",
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
          matchDate: "T00:00:00.000Z",
          status: "pending" as const,
        },
        {
          matchId: "D2",
          homeTeam: { code: "ESP", name: "Spain" },
          awayTeam: { code: "KOS", name: "Kosovo" },
          matchDate: "T00:00:00.000Z",
          status: "pending" as const,
        },
        {
          matchId: "D3",
          homeTeam: { code: "BRA", name: "Brazil" },
          awayTeam: { code: "KOS", name: "Kosovo" },
          matchDate: "T00:00:00.000Z",
          status: "pending" as const,
        },
        {
          matchId: "D4",
          homeTeam: { code: "CRO", name: "Croatia" },
          awayTeam: { code: "ESP", name: "Spain" },
          matchDate: "T00:00:00.000Z",
          status: "pending" as const,
        },
        {
          matchId: "D5",
          homeTeam: { code: "KOS", name: "Kosovo" },
          awayTeam: { code: "BRA", name: "Brazil" },
          matchDate: "T00:00:00.000Z",
          status: "pending" as const,
        },
        {
          matchId: "D6",
          homeTeam: { code: "ESP", name: "Spain" },
          awayTeam: { code: "CRO", name: "Croatia" },
          matchDate: "T00:00:00.000Z",
          status: "pending" as const,
        },
      ],
    },
    {
      name: "Group E",
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
          matchDate: "T00:00:00.000Z",
          status: "pending" as const,
        },
        {
          matchId: "E2",
          homeTeam: { code: "BEL", name: "Belgium" },
          awayTeam: { code: "ALB", name: "Albania" },
          matchDate: "T00:00:00.000Z",
          status: "pending" as const,
        },
        {
          matchId: "E3",
          homeTeam: { code: "GER", name: "Germany" },
          awayTeam: { code: "ALB", name: "Albania" },
          matchDate: "T00:00:00.000Z",
          status: "pending" as const,
        },
        {
          matchId: "E4",
          homeTeam: { code: "CZE", name: "Czech Republic" },
          awayTeam: { code: "BEL", name: "Belgium" },
          matchDate: "T00:00:00.000Z",
          status: "pending" as const,
        },
        {
          matchId: "E5",
          homeTeam: { code: "ALB", name: "Albania" },
          awayTeam: { code: "GER", name: "Germany" },
          matchDate: "T00:00:00.000Z",
          status: "pending" as const,
        },
        {
          matchId: "E6",
          homeTeam: { code: "BEL", name: "Belgium" },
          awayTeam: { code: "CZE", name: "Czech Republic" },
          matchDate: "T00:00:00.000Z",
          status: "pending" as const,
        },
      ],
    },
    {
      name: "Group F",
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
          matchDate: "T00:00:00.000Z",
          status: "pending" as const,
        },
        {
          matchId: "F2",
          homeTeam: { code: "POR", name: "Portugal" },
          awayTeam: { code: "SVN", name: "Slovenia" },
          matchDate: "T00:00:00.000Z",
          status: "pending" as const,
        },
        {
          matchId: "F3",
          homeTeam: { code: "ITA", name: "Italy" },
          awayTeam: { code: "SVN", name: "Slovenia" },
          matchDate: "T00:00:00.000Z",
          status: "pending" as const,
        },
        {
          matchId: "F4",
          homeTeam: { code: "POL", name: "Poland" },
          awayTeam: { code: "POR", name: "Portugal" },
          matchDate: "T00:00:00.000Z",
          status: "pending" as const,
        },
        {
          matchId: "F5",
          homeTeam: { code: "SVN", name: "Slovenia" },
          awayTeam: { code: "ITA", name: "Italy" },
          matchDate: "T00:00:00.000Z",
          status: "pending" as const,
        },
        {
          matchId: "F6",
          homeTeam: { code: "POR", name: "Portugal" },
          awayTeam: { code: "POL", name: "Poland" },
          matchDate: "T00:00:00.000Z",
          status: "pending" as const,
        },
      ],
    },
    {
      name: "Group G",
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
          matchDate: "T00:00:00.000Z",
          status: "pending" as const,
        },
        {
          matchId: "G2",
          homeTeam: { code: "AUS", name: "Australia" },
          awayTeam: { code: "SRB", name: "Serbia" },
          matchDate: "T00:00:00.000Z",
          status: "pending" as const,
        },
        {
          matchId: "G3",
          homeTeam: { code: "JPN", name: "Japan" },
          awayTeam: { code: "SRB", name: "Serbia" },
          matchDate: "T00:00:00.000Z",
          status: "pending" as const,
        },
        {
          matchId: "G4",
          homeTeam: { code: "ZMB", name: "Zambia" },
          awayTeam: { code: "AUS", name: "Australia" },
          matchDate: "T00:00:00.000Z",
          status: "pending" as const,
        },
        {
          matchId: "G5",
          homeTeam: { code: "SRB", name: "Serbia" },
          awayTeam: { code: "JPN", name: "Japan" },
          matchDate: "T00:00:00.000Z",
          status: "pending" as const,
        },
        {
          matchId: "G6",
          homeTeam: { code: "AUS", name: "Australia" },
          awayTeam: { code: "ZMB", name: "Zambia" },
          matchDate: "T00:00:00.000Z",
          status: "pending" as const,
        },
      ],
    },
    {
      name: "Group H",
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
          matchDate: "T00:00:00.000Z",
          status: "pending" as const,
        },
        {
          matchId: "H2",
          homeTeam: { code: "NOR", name: "Norway" },
          awayTeam: { code: "SVK", name: "Slovakia" },
          matchDate: "T00:00:00.000Z",
          status: "pending" as const,
        },
        {
          matchId: "H3",
          homeTeam: { code: "MAR", name: "Morocco" },
          awayTeam: { code: "SVK", name: "Slovakia" },
          matchDate: "T00:00:00.000Z",
          status: "pending" as const,
        },
        {
          matchId: "H4",
          homeTeam: { code: "BIH", name: "Bosnia" },
          awayTeam: { code: "NOR", name: "Norway" },
          matchDate: "T00:00:00.000Z",
          status: "pending" as const,
        },
        {
          matchId: "H5",
          homeTeam: { code: "SVK", name: "Slovakia" },
          awayTeam: { code: "MAR", name: "Morocco" },
          matchDate: "T00:00:00.000Z",
          status: "pending" as const,
        },
        {
          matchId: "H6",
          homeTeam: { code: "NOR", name: "Norway" },
          awayTeam: { code: "BIH", name: "Bosnia" },
          matchDate: "T00:00:00.000Z",
          status: "pending" as const,
        },
      ],
    },
    {
      name: "Group I",
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
          matchDate: "T00:00:00.000Z",
          status: "pending" as const,
        },
        {
          matchId: "I2",
          homeTeam: { code: "UKR", name: "Ukraine" },
          awayTeam: { code: "ISL", name: "Iceland" },
          matchDate: "T00:00:00.000Z",
          status: "pending" as const,
        },
        {
          matchId: "I3",
          homeTeam: { code: "ROU", name: "Romania" },
          awayTeam: { code: "ISL", name: "Iceland" },
          matchDate: "T00:00:00.000Z",
          status: "pending" as const,
        },
        {
          matchId: "I4",
          homeTeam: { code: "BOL", name: "Bolivia" },
          awayTeam: { code: "UKR", name: "Ukraine" },
          matchDate: "T00:00:00.000Z",
          status: "pending" as const,
        },
        {
          matchId: "I5",
          homeTeam: { code: "ISL", name: "Iceland" },
          awayTeam: { code: "ROU", name: "Romania" },
          matchDate: "T00:00:00.000Z",
          status: "pending" as const,
        },
        {
          matchId: "I6",
          homeTeam: { code: "UKR", name: "Ukraine" },
          awayTeam: { code: "BOL", name: "Bolivia" },
          matchDate: "T00:00:00.000Z",
          status: "pending" as const,
        },
      ],
    },
    {
      name: "Group J",
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
          matchDate: "T00:00:00.000Z",
          status: "pending" as const,
        },
        {
          matchId: "J2",
          homeTeam: { code: "ECU", name: "Ecuador" },
          awayTeam: { code: "PAR", name: "Paraguay" },
          matchDate: "T00:00:00.000Z",
          status: "pending" as const,
        },
        {
          matchId: "J3",
          homeTeam: { code: "COL", name: "Colombia" },
          awayTeam: { code: "PAR", name: "Paraguay" },
          matchDate: "T00:00:00.000Z",
          status: "pending" as const,
        },
        {
          matchId: "J4",
          homeTeam: { code: "IRQ", name: "Iraq" },
          awayTeam: { code: "ECU", name: "Ecuador" },
          matchDate: "T00:00:00.000Z",
          status: "pending" as const,
        },
        {
          matchId: "J5",
          homeTeam: { code: "PAR", name: "Paraguay" },
          awayTeam: { code: "COL", name: "Colombia" },
          matchDate: "T00:00:00.000Z",
          status: "pending" as const,
        },
        {
          matchId: "J6",
          homeTeam: { code: "ECU", name: "Ecuador" },
          awayTeam: { code: "IRQ", name: "Iraq" },
          matchDate: "T00:00:00.000Z",
          status: "pending" as const,
        },
      ],
    },
    {
      name: "Group K",
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
          matchDate: "T00:00:00.000Z",
          status: "pending" as const,
        },
        {
          matchId: "K2",
          homeTeam: { code: "TUN", name: "Tunisia" },
          awayTeam: { code: "GUA", name: "Guatemala" },
          matchDate: "T00:00:00.000Z",
          status: "pending" as const,
        },
        {
          matchId: "K3",
          homeTeam: { code: "KOR", name: "South Korea" },
          awayTeam: { code: "GUA", name: "Guatemala" },
          matchDate: "T00:00:00.000Z",
          status: "pending" as const,
        },
        {
          matchId: "K4",
          homeTeam: { code: "TAI", name: "Thailand" },
          awayTeam: { code: "TUN", name: "Tunisia" },
          matchDate: "T00:00:00.000Z",
          status: "pending" as const,
        },
        {
          matchId: "K5",
          homeTeam: { code: "GUA", name: "Guatemala" },
          awayTeam: { code: "KOR", name: "South Korea" },
          matchDate: "T00:00:00.000Z",
          status: "pending" as const,
        },
        {
          matchId: "K6",
          homeTeam: { code: "TUN", name: "Tunisia" },
          awayTeam: { code: "TAI", name: "Thailand" },
          matchDate: "T00:00:00.000Z",
          status: "pending" as const,
        },
      ],
    },
    {
      name: "Group L",
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
          matchDate: "T00:00:00.000Z",
          status: "pending" as const,
        },
        {
          matchId: "L2",
          homeTeam: { code: "EGY", name: "Egypt" },
          awayTeam: { code: "GHA", name: "Ghana" },
          matchDate: "T00:00:00.000Z",
          status: "pending" as const,
        },
        {
          matchId: "L3",
          homeTeam: { code: "CIV", name: "Côte d'Ivoire" },
          awayTeam: { code: "GHA", name: "Ghana" },
          matchDate: "T00:00:00.000Z",
          status: "pending" as const,
        },
        {
          matchId: "L4",
          homeTeam: { code: "VIE", name: "Vietnam" },
          awayTeam: { code: "EGY", name: "Egypt" },
          matchDate: "T00:00:00.000Z",
          status: "pending" as const,
        },
        {
          matchId: "L5",
          homeTeam: { code: "GHA", name: "Ghana" },
          awayTeam: { code: "CIV", name: "Côte d'Ivoire" },
          matchDate: "T00:00:00.000Z",
          status: "pending" as const,
        },
        {
          matchId: "L6",
          homeTeam: { code: "EGY", name: "Egypt" },
          awayTeam: { code: "VIE", name: "Vietnam" },
          matchDate: "T00:00:00.000Z",
          status: "pending" as const,
        },
      ],
    },
  ],
  knockout: {
    roundOf32: [
      {
        matchId: "R32_1",
        teamA: { code: "A1", name: "Winner Group A" },
        teamB: { code: "B2", name: "Runner-up Group B" },
        status: "pending" as const,
      },
      {
        matchId: "R32_2",
        teamA: { code: "B1", name: "Winner Group B" },
        teamB: { code: "A2", name: "Runner-up Group A" },
        status: "pending" as const,
      },
      {
        matchId: "R32_3",
        teamA: { code: "C1", name: "Winner Group C" },
        teamB: { code: "D2", name: "Runner-up Group D" },
        status: "pending" as const,
      },
      {
        matchId: "R32_4",
        teamA: { code: "D1", name: "Winner Group D" },
        teamB: { code: "C2", name: "Runner-up Group C" },
        status: "pending" as const,
      },
      {
        matchId: "R32_5",
        teamA: { code: "E1", name: "Winner Group E" },
        teamB: { code: "F2", name: "Runner-up Group F" },
        status: "pending" as const,
      },
      {
        matchId: "R32_6",
        teamA: { code: "F1", name: "Winner Group F" },
        teamB: { code: "E2", name: "Runner-up Group E" },
        status: "pending" as const,
      },
      {
        matchId: "R32_7",
        teamA: { code: "G1", name: "Winner Group G" },
        teamB: { code: "H2", name: "Runner-up Group H" },
        status: "pending" as const,
      },
      {
        matchId: "R32_8",
        teamA: { code: "H1", name: "Winner Group H" },
        teamB: { code: "G2", name: "Runner-up Group G" },
        status: "pending" as const,
      },
      {
        matchId: "R32_9",
        teamA: { code: "I1", name: "Winner Group I" },
        teamB: { code: "J2", name: "Runner-up Group J" },
        status: "pending" as const,
      },
      {
        matchId: "R32_10",
        teamA: { code: "J1", name: "Winner Group J" },
        teamB: { code: "I2", name: "Runner-up Group I" },
        status: "pending" as const,
      },
      {
        matchId: "R32_11",
        teamA: { code: "K1", name: "Winner Group K" },
        teamB: { code: "L2", name: "Runner-up Group L" },
        status: "pending" as const,
      },
      {
        matchId: "R32_12",
        teamA: { code: "L1", name: "Winner Group L" },
        teamB: { code: "K2", name: "Runner-up Group K" },
        status: "pending" as const,
      },
      {
        matchId: "R32_13",
        teamA: { code: "A3rd", name: "3rd Place Group A" },
        teamB: { code: "B3rd", name: "3rd Place Group B" },
        status: "pending" as const,
      },
      {
        matchId: "R32_14",
        teamA: { code: "C3rd", name: "3rd Place Group C" },
        teamB: { code: "D3rd", name: "3rd Place Group D" },
        status: "pending" as const,
      },
      {
        matchId: "R32_15",
        teamA: { code: "E3rd", name: "3rd Place Group E" },
        teamB: { code: "F3rd", name: "3rd Place Group F" },
        status: "pending" as const,
      },
      {
        matchId: "R32_16",
        teamA: { code: "G3rd", name: "3rd Place Group G" },
        teamB: { code: "H3rd", name: "3rd Place Group H" },
        status: "pending" as const,
      },
    ],
    roundOf16: [
      {
        matchId: "R16_1",
        teamA: { code: "W_R32_1", name: "Winner R32 Match 1" },
        teamB: { code: "W_R32_2", name: "Winner R32 Match 2" },
        status: "pending" as const,
      },
      {
        matchId: "R16_2",
        teamA: { code: "W_R32_3", name: "Winner R32 Match 3" },
        teamB: { code: "W_R32_4", name: "Winner R32 Match 4" },
        status: "pending" as const,
      },
      {
        matchId: "R16_3",
        teamA: { code: "W_R32_5", name: "Winner R32 Match 5" },
        teamB: { code: "W_R32_6", name: "Winner R32 Match 6" },
        status: "pending" as const,
      },
      {
        matchId: "R16_4",
        teamA: { code: "W_R32_7", name: "Winner R32 Match 7" },
        teamB: { code: "W_R32_8", name: "Winner R32 Match 8" },
        status: "pending" as const,
      },
      {
        matchId: "R16_5",
        teamA: { code: "W_R32_9", name: "Winner R32 Match 9" },
        teamB: { code: "W_R32_10", name: "Winner R32 Match 10" },
        status: "pending" as const,
      },
      {
        matchId: "R16_6",
        teamA: { code: "W_R32_11", name: "Winner R32 Match 11" },
        teamB: { code: "W_R32_12", name: "Winner R32 Match 12" },
        status: "pending" as const,
      },
      {
        matchId: "R16_7",
        teamA: { code: "W_R32_13", name: "Winner R32 Match 13" },
        teamB: { code: "W_R32_14", name: "Winner R32 Match 14" },
        status: "pending" as const,
      },
      {
        matchId: "R16_8",
        teamA: { code: "W_R32_15", name: "Winner R32 Match 15" },
        teamB: { code: "W_R32_16", name: "Winner R32 Match 16" },
        status: "pending" as const,
      },
    ],
    quarterfinals: [],
    semifinals: [],
    final: [],
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
