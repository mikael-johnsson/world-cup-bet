import connectDB from "@/lib/db";
import { Tournament } from "@/models/Tournament";
import { TournamentType } from "@/types";

// 2026 World Cup teams and groups (realistic setup)

const NEW_TOURNAMENT_DATA: TournamentType = {
  year: 2026,
  groups: [
    {
      name: "Grupp A",
      teams: [
        { code: "MEX", name: "Mexiko" },
        { code: "RSA", name: "Sydafrika" },
        { code: "KOR", name: "Sydkorea" },
        { code: "CZH", name: "Tjeckien" },
      ],
      fixtures: [
        {
          matchId: "A1",
          homeTeam: { code: "MEX", name: "Mexiko" },
          awayTeam: { code: "RSA", name: "Sydafrika" },
          matchDate: "2026-06-11T21:00:00+02:00",
          status: "pending",
        },
        {
          matchId: "A2",
          homeTeam: { code: "KOR", name: "Sydkorea" },
          awayTeam: { code: "CZH", name: "Tjeckien" },
          matchDate: "2026-06-12T04:00:00+02:00",
          status: "pending",
        },
        {
          matchId: "A3",
          homeTeam: { code: "MEX", name: "Mexiko" },
          awayTeam: { code: "KOR", name: "Sydkorea" },
          matchDate: "2026-06-19T03:00:00+02:00",
          status: "pending",
        },
        {
          matchId: "A4",
          homeTeam: { code: "CZH", name: "Tjeckien" },
          awayTeam: { code: "RSA", name: "Sydafrika" },
          matchDate: "2026-06-18T18:00:00+02:00",
          status: "pending",
        },
        {
          matchId: "A5",
          homeTeam: { code: "CZH", name: "Tjeckien" },
          awayTeam: { code: "MEX", name: "Mexiko" },
          matchDate: "2026-06-25T03:00:00+02:00",
          status: "pending",
        },
        {
          matchId: "A6",
          homeTeam: { code: "RSA", name: "Sydafrika" },
          awayTeam: { code: "KOR", name: "Sydkorea" },
          matchDate: "2026-06-25T03:00:00+02:00",
          status: "pending",
        },
      ],
    },
    {
      name: "Grupp B",
      teams: [
        { code: "CAN", name: "Kanada" },
        { code: "BZH", name: "Bosnien-Hercegovina" },
        { code: "QAT", name: "Qatar" },
        { code: "SUI", name: "Schweiz" },
      ],
      fixtures: [
        {
          matchId: "B1",
          homeTeam: { code: "CAN", name: "Kanada" },
          awayTeam: { code: "BZH", name: "Bosnien-Hercegovina" },
          matchDate: "2026-06-12T21:00:00+02:00",
          status: "pending",
        },
        {
          matchId: "B2",
          homeTeam: { code: "QAT", name: "Qatar" },
          awayTeam: { code: "SUI", name: "Schweiz" },
          matchDate: "2026-06-13T21:00:00+02:00",
          status: "pending",
        },
        {
          matchId: "B3",
          homeTeam: { code: "CAN", name: "Kanada" },
          awayTeam: { code: "QAT", name: "Qatar" },
          matchDate: "2026-06-19T00:00:00+02:00",
          status: "pending",
        },
        {
          matchId: "B4",
          homeTeam: { code: "SUI", name: "Schweiz" },
          awayTeam: { code: "BZH", name: "Bosnien-Hercegovina" },
          matchDate: "2026-06-18T21:00:00+02:00",
          status: "pending",
        },
        {
          matchId: "B5",
          homeTeam: { code: "SUI", name: "Schweiz" },
          awayTeam: { code: "CAN", name: "Kanada" },
          matchDate: "2026-06-24T21:00:00+02:00",
          status: "pending",
        },
        {
          matchId: "B6",
          homeTeam: { code: "BZH", name: "Bosnien-Hercegovina" },
          awayTeam: { code: "QAT", name: "Qatar" },
          matchDate: "2026-06-24T21:00:00+02:00",
          status: "pending",
        },
      ],
    },
    {
      name: "Grupp C",
      teams: [
        { code: "BRA", name: "Brasilien" },
        { code: "MAR", name: "Marocko" },
        { code: "HAI", name: "Haiti" },
        { code: "SCO", name: "Skottland" },
      ],
      fixtures: [
        {
          matchId: "C1",
          homeTeam: { code: "BRA", name: "Brasilien" },
          awayTeam: { code: "MAR", name: "Marocko" },
          matchDate: "2026-06-14T00:00:00+02:00",
          status: "pending",
        },
        {
          matchId: "C2",
          homeTeam: { code: "HAI", name: "Haiti" },
          awayTeam: { code: "SCO", name: "Skottland" },
          matchDate: "2026-06-14T03:00:00+02:00",
          status: "pending",
        },
        {
          matchId: "C3",
          homeTeam: { code: "BRA", name: "Brasilien" },
          awayTeam: { code: "HAI", name: "Haiti" },
          matchDate: "2026-06-20T03:00:00+02:00",
          status: "pending",
        },
        {
          matchId: "C4",
          homeTeam: { code: "SCO", name: "Skottland" },
          awayTeam: { code: "MAR", name: "Marocko" },
          matchDate: "2026-06-20T00:00:00+02:00",
          status: "pending",
        },
        {
          matchId: "C5",
          homeTeam: { code: "SCO", name: "Skottland" },
          awayTeam: { code: "BRA", name: "Brasilien" },
          matchDate: "2026-06-25T03:00:00+02:00",
          status: "pending",
        },
        {
          matchId: "C6",
          homeTeam: { code: "MAR", name: "Marocko" },
          awayTeam: { code: "HAI", name: "Haiti" },
          matchDate: "2026-06-25T00:00:00+02:00",
          status: "pending",
        },
      ],
    },
    {
      name: "Grupp D",
      teams: [
        { code: "USA", name: "USA" },
        { code: "PAR", name: "Paraguay" },
        { code: "AUS", name: "Australia" },
        { code: "TUR", name: "Turkiet" },
      ],
      fixtures: [
        {
          matchId: "D1",
          homeTeam: { code: "USA", name: "USA" },
          awayTeam: { code: "PAR", name: "Paraguay" },
          matchDate: "2026-06-13T03:00:00+02:00",
          status: "pending",
        },
        {
          matchId: "D2",
          homeTeam: { code: "AUS", name: "Australia" },
          awayTeam: { code: "TUR", name: "Turkiet" },
          matchDate: "2026-06-14T06:00:00+02:00",
          status: "pending",
        },
        {
          matchId: "D3",
          homeTeam: { code: "USA", name: "USA" },
          awayTeam: { code: "AUS", name: "Australia" },
          matchDate: "2026-06-19T21:00:00+02:00",
          status: "pending",
        },
        {
          matchId: "D4",
          homeTeam: { code: "TUR", name: "Turkiet" },
          awayTeam: { code: "PAR", name: "Paraguay" },
          matchDate: "2026-06-20T06:00:00+02:00",
          status: "pending",
        },
        {
          matchId: "D5",
          homeTeam: { code: "TUR", name: "Turkiet" },
          awayTeam: { code: "USA", name: "USA" },
          matchDate: "2026-06-26T04:00:00+02:00",
          status: "pending",
        },
        {
          matchId: "D6",
          homeTeam: { code: "PAR", name: "Paraguay" },
          awayTeam: { code: "AUS", name: "Australia" },
          matchDate: "2026-06-26T04:00:00+02:00",
          status: "pending",
        },
      ],
    },
    {
      name: "Grupp E",
      teams: [
        { code: "GER", name: "Tyskland" },
        { code: "CUW", name: "Curaçao" },
        { code: "CIV", name: "Elfenbenskusten" },
        { code: "ECU", name: "Ecuador" },
      ],
      fixtures: [
        {
          matchId: "E1",
          homeTeam: { code: "GER", name: "Tyskland" },
          awayTeam: { code: "CUW", name: "Curaçao" },
          matchDate: "2026-06-14T19:00:00+02:00",
          status: "pending",
        },
        {
          matchId: "E2",
          homeTeam: { code: "CIV", name: "Elfenbenskusten" },
          awayTeam: { code: "ECU", name: "Ecuador" },
          matchDate: "2026-06-15T01:00:00+02:00",
          status: "pending",
        },
        {
          matchId: "E3",
          homeTeam: { code: "GER", name: "Tyskland" },
          awayTeam: { code: "CIV", name: "Elfenbenskusten" },
          matchDate: "2026-06-20T22:00:00+02:00",
          status: "pending",
        },
        {
          matchId: "E4",
          homeTeam: { code: "ECU", name: "Ecuador" },
          awayTeam: { code: "CUW", name: "Curaçao" },
          matchDate: "2026-06-21T02:00:00+02:00",
          status: "pending",
        },
        {
          matchId: "E5",
          homeTeam: { code: "CUW", name: "Curaçao" },
          awayTeam: { code: "CIV", name: "Elfenbenskusten" },
          matchDate: "2026-06-25T22:00:00+02:00",
          status: "pending",
        },
        {
          matchId: "E6",
          homeTeam: { code: "ECU", name: "Ecuador" },
          awayTeam: { code: "GER", name: "Tyskland" },
          matchDate: "2026-06-25T22:00:00+02:00",
          status: "pending",
        },
      ],
    },
    {
      name: "Grupp F",
      teams: [
        { code: "NED", name: "Nederländerna" },
        { code: "JPN", name: "Japan" },
        { code: "SWE", name: "Sverige" },
        { code: "TUN", name: "Tunisien" },
      ],
      fixtures: [
        {
          matchId: "F1",
          homeTeam: { code: "NED", name: "Nederländerna" },
          awayTeam: { code: "JPN", name: "Japan" },
          matchDate: "2026-06-14T15:00:00+02:00",
          status: "pending",
        },
        {
          matchId: "F2",
          homeTeam: { code: "SWE", name: "Sverige" },
          awayTeam: { code: "TUN", name: "Tunisien" },
          matchDate: "2026-06-15T04:00:00+02:00",
          status: "pending",
        },
        {
          matchId: "F3",
          homeTeam: { code: "NED", name: "Nederländerna" },
          awayTeam: { code: "SWE", name: "Sverige" },
          matchDate: "2026-06-20T19:00:00+02:00",
          status: "pending",
        },
        {
          matchId: "F4",
          homeTeam: { code: "TUN", name: "Tunisien" },
          awayTeam: { code: "JPN", name: "Japan" },
          matchDate: "2026-06-21T06:00:00+02:00",
          status: "pending",
        },
        {
          matchId: "F5",
          homeTeam: { code: "JPN", name: "Japan" },
          awayTeam: { code: "SWE", name: "Sverige" },
          matchDate: "2026-06-26T01:00:00+02:00",
          status: "pending",
        },
        {
          matchId: "F6",
          homeTeam: { code: "TUN", name: "Tunisien" },
          awayTeam: { code: "NED", name: "Nederländerna" },
          matchDate: "2026-06-26T01:00:00+02:00",
          status: "pending",
        },
      ],
    },
    {
      name: "Grupp G",
      teams: [
        { code: "BEL", name: "Belgien" },
        { code: "EGY", name: "Egypten" },
        { code: "IRN", name: "Iran" },
        { code: "NZL", name: "Nya Zeeland" },
      ],
      fixtures: [
        {
          matchId: "G1",
          homeTeam: { code: "BEL", name: "Belgien" },
          awayTeam: { code: "EGY", name: "Egypten" },
          matchDate: "2026-06-15T15:00:00+02:00",
          status: "pending",
        },
        {
          matchId: "G2",
          homeTeam: { code: "IRN", name: "Iran" },
          awayTeam: { code: "NZL", name: "Nya Zeeland" },
          matchDate: "2026-06-15T18:00:00+02:00",
          status: "pending",
        },
        {
          matchId: "G3",
          homeTeam: { code: "BEL", name: "Belgien" },
          awayTeam: { code: "IRN", name: "Iran" },
          matchDate: "2026-06-21T21:00:00+02:00",
          status: "pending",
        },
        {
          matchId: "G4",
          homeTeam: { code: "NZL", name: "Nya Zeeland" },
          awayTeam: { code: "EGY", name: "Egypten" },
          matchDate: "2026-06-21T21:00:00+02:00",
          status: "pending",
        },
        {
          matchId: "G5",
          homeTeam: { code: "EGY", name: "Egypten" },
          awayTeam: { code: "IRN", name: "Iran" },
          matchDate: "2026-06-27T05:00:00+02:00",
          status: "pending",
        },
        {
          matchId: "G6",
          homeTeam: { code: "NZL", name: "Nya Zeeland" },
          awayTeam: { code: "BEL", name: "Belgien" },
          matchDate: "2026-06-27T05:00:00+02:00",
          status: "pending",
        },
      ],
    },
    {
      name: "Grupp H",
      teams: [
        { code: "ESP", name: "Spanien" },
        { code: "CPV", name: "Kap Verde" },
        { code: "KSA", name: "Saudiarabien" },
        { code: "URU", name: "Uruguay" },
      ],
      fixtures: [
        {
          matchId: "H1",
          homeTeam: { code: "ESP", name: "Spanien" },
          awayTeam: { code: "CPV", name: "Kap Verde" },
          matchDate: "2026-06-15T18:00:00+02:00",
          status: "pending",
        },
        {
          matchId: "H2",
          homeTeam: { code: "KSA", name: "Saudiarabien" },
          awayTeam: { code: "URU", name: "Uruguay" },
          matchDate: "2026-06-16T00:00:00+02:00",
          status: "pending",
        },
        {
          matchId: "H3",
          homeTeam: { code: "ESP", name: "Spanien" },
          awayTeam: { code: "KSA", name: "Saudiarabien" },
          matchDate: "2026-06-21T18:00:00+02:00",
          status: "pending",
        },
        {
          matchId: "H4",
          homeTeam: { code: "URU", name: "Uruguay" },
          awayTeam: { code: "CPV", name: "Kap Verde" },
          matchDate: "2026-06-22T00:00:00+02:00",
          status: "pending",
        },
        {
          matchId: "H5",
          homeTeam: { code: "CPV", name: "Kap Verde" },
          awayTeam: { code: "KSA", name: "Saudiarabien" },
          matchDate: "2026-06-27T02:00:00+02:00",
          status: "pending",
        },
        {
          matchId: "H6",
          homeTeam: { code: "URU", name: "Uruguay" },
          awayTeam: { code: "ESP", name: "Spanien" },
          matchDate: "2026-06-27T05:00:00+02:00",
          status: "pending",
        },
      ],
    },
    {
      name: "Grupp I",
      teams: [
        { code: "FRA", name: "Frankrike" },
        { code: "SEN", name: "Senegal" },
        { code: "IRQ", name: "Irak" },
        { code: "NOR", name: "Norge" },
      ],
      fixtures: [
        {
          matchId: "I1",
          homeTeam: { code: "FRA", name: "Frankrike" },
          awayTeam: { code: "SEN", name: "Senegal" },
          matchDate: "2026-06-16T21:00:00+02:00",
          status: "pending",
        },
        {
          matchId: "I2",
          homeTeam: { code: "IRQ", name: "Irak" },
          awayTeam: { code: "NOR", name: "Norge" },
          matchDate: "2026-06-17T00:00:00+02:00",
          status: "pending",
        },
        {
          matchId: "I3",
          homeTeam: { code: "FRA", name: "Frankrike" },
          awayTeam: { code: "IRQ", name: "Irak" },
          matchDate: "2026-06-22T23:00:00+02:00",
          status: "pending",
        },
        {
          matchId: "I4",
          homeTeam: { code: "NOR", name: "Norge" },
          awayTeam: { code: "SEN", name: "Senegal" },
          matchDate: "2026-06-23T02:00:00+02:00",
          status: "pending",
        },
        {
          matchId: "I5",
          homeTeam: { code: "NOR", name: "Norge" },
          awayTeam: { code: "FRA", name: "Frankrike" },
          matchDate: "2026-06-26T21:00:00+02:00",
          status: "pending",
        },
        {
          matchId: "I6",
          homeTeam: { code: "SEN", name: "Senegal" },
          awayTeam: { code: "IRQ", name: "Irak" },
          matchDate: "2026-06-26T21:00:00+02:00",
          status: "pending",
        },
      ],
    },
    {
      name: "Grupp J",
      teams: [
        { code: "ARG", name: "Argentina" },
        { code: "ALG", name: "Algeriet" },
        { code: "AUT", name: "Österrike" },
        { code: "JOR", name: "Jordanien" },
      ],
      fixtures: [
        {
          matchId: "J1",
          homeTeam: { code: "ARG", name: "Argentina" },
          awayTeam: { code: "ALG", name: "Algeriet" },
          matchDate: "2026-06-17T03:00:00+02:00",
          status: "pending",
        },
        {
          matchId: "J2",
          homeTeam: { code: "AUT", name: "Österrike" },
          awayTeam: { code: "JOR", name: "Jordanien" },
          matchDate: "2026-06-17T06:00:00+02:00",
          status: "pending",
        },
        {
          matchId: "J3",
          homeTeam: { code: "ARG", name: "Argentina" },
          awayTeam: { code: "AUT", name: "Österrike" },
          matchDate: "2026-06-22T19:00:00+02:00",
          status: "pending",
        },
        {
          matchId: "J4",
          homeTeam: { code: "JOR", name: "Jordanien" },
          awayTeam: { code: "ALG", name: "Algeriet" },
          matchDate: "2026-06-23T05:00:00+02:00",
          status: "pending",
        },
        {
          matchId: "J5",
          homeTeam: { code: "ALG", name: "Algeriet" },
          awayTeam: { code: "AUT", name: "Österrike" },
          matchDate: "2026-06-28T04:00:00+02:00",
          status: "pending",
        },
        {
          matchId: "J6",
          homeTeam: { code: "JOR", name: "Jordanien" },
          awayTeam: { code: "ARG", name: "Argentina" },
          matchDate: "2026-06-28T04:00:00+02:00",
          status: "pending",
        },
      ],
    },
    {
      name: "Grupp K",
      teams: [
        { code: "POR", name: "Portugal" },
        { code: "CDR", name: "Demokratiska republiken Kongo" },
        { code: "UZB", name: "Uzbekistan" },
        { code: "COL", name: "Colombia" },
      ],
      fixtures: [
        {
          matchId: "K1",
          homeTeam: { code: "POR", name: "Portugal" },
          awayTeam: { code: "CDR", name: "Demokratiska republiken Kongo" },
          matchDate: "2026-06-17T19:00:00+02:00",
          status: "pending",
        },
        {
          matchId: "K2",
          homeTeam: { code: "UZB", name: "Uzbekistan" },
          awayTeam: { code: "COL", name: "Colombia" },
          matchDate: "2026-06-18T04:00:00+02:00",
          status: "pending",
        },
        {
          matchId: "K3",
          homeTeam: { code: "POR", name: "Portugal" },
          awayTeam: { code: "UZB", name: "Uzbekistan" },
          matchDate: "2026-06-23T22:00:00+02:00",
          status: "pending",
        },
        {
          matchId: "K4",
          homeTeam: { code: "COL", name: "Colombia" },
          awayTeam: { code: "CDR", name: "Demokratiska republiken Kongo" },
          matchDate: "2026-06-24T04:00:00+02:00",
          status: "pending",
        },
        {
          matchId: "K5",
          homeTeam: { code: "COL", name: "Colombia" },
          awayTeam: { code: "POR", name: "Portugal" },
          matchDate: "2026-06-28T01:30:00+02:00",
          status: "pending",
        },
        {
          matchId: "K6",
          homeTeam: { code: "CDR", name: "Demokratiska republiken Kongo" },
          awayTeam: { code: "UZB", name: "Uzbekistan" },
          matchDate: "2026-06-28T04:00:00+02:00",
          status: "pending",
        },
      ],
    },
    {
      name: "Grupp L",
      teams: [
        { code: "ENG", name: "England" },
        { code: "CRO", name: "Kroatien" },
        { code: "GHA", name: "Ghana" },
        { code: "PAN", name: "Panama" },
      ],
      fixtures: [
        {
          matchId: "L1",
          homeTeam: { code: "ENG", name: "England" },
          awayTeam: { code: "CRO", name: "Kroatien" },
          matchDate: "2026-06-17T15:00:00+02:00",
          status: "pending",
        },
        {
          matchId: "L2",
          homeTeam: { code: "GHA", name: "Ghana" },
          awayTeam: { code: "PAN", name: "Panama" },
          matchDate: "2026-06-17T19:00:00+02:00",
          status: "pending",
        },
        {
          matchId: "L3",
          homeTeam: { code: "ENG", name: "England" },
          awayTeam: { code: "GHA", name: "Ghana" },
          matchDate: "2026-06-23T22:00:00+02:00",
          status: "pending",
        },
        {
          matchId: "L4",
          homeTeam: { code: "PAN", name: "Panama" },
          awayTeam: { code: "CRO", name: "Kroatien" },
          matchDate: "2026-06-24T01:00:00+02:00",
          status: "pending",
        },
        {
          matchId: "L5",
          homeTeam: { code: "PAN", name: "Panama" },
          awayTeam: { code: "ENG", name: "England" },
          matchDate: "2026-06-27T23:00:00+02:00",
          status: "pending",
        },
        {
          matchId: "L6",
          homeTeam: { code: "CRO", name: "Kroatien" },
          awayTeam: { code: "GHA", name: "Ghana" },
          matchDate: "2026-06-27T23:00:00+02:00",
          status: "pending",
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
      return existing;
    }

    const tournament = await Tournament.create(NEW_TOURNAMENT_DATA);
    return tournament;
  } catch (error) {
    console.error("Error seeding tournament:", error);
    throw error;
  }
}
