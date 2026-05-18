export const getOdds = async () => {
  const base_url = process.env.NEXT_PUBLIC_ODDS_BASE_URL;
  if (!base_url) {
    console.log("error");
    return;
  }
  const res = await fetch(base_url);
  const data = await res.json();
  return data;
};
