export const getOdds = async () => {
  const base_url = process.env.NEXT_PUBLIC_ODDS_BASE_URL;
  if (!base_url) {
    console.log("Missing NEXT_PUBLIC_ODDS_BASE_URL variable");
    return;
  }
  const res = await fetch(base_url);
  const data = await res.json();
  return data;
};
