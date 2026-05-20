"use client";

import { type Odds } from "@/types";

type OddsProps = {
  odds: Odds[];
};

const Odds = ({ odds }: OddsProps) => {
  if (odds.length === 0) {
    return <p>No odds found</p>;
  }
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6 my-5">
      {odds[0].bookmakers.map((bookmaker) => {
        return (
          <div key={bookmaker.key}>
            <h2 className="mb-4 text-xl font-bold">Senaste oddsen</h2>
            <div className="flex justify-between">
              <span className="font-bold">Land</span>
              <span className="font-bold">Odds</span>
            </div>
            {bookmaker.markets[0].outcomes.map((outcome) => {
              return (
                <div className="flex justify-between" key={outcome.name}>
                  <span>{outcome.name}</span>
                  <span>{outcome.price}</span>
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
};

export default Odds;
