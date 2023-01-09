/*
Calculating emissionsFactor (gCO2/gas)
**/

/*
From Kyle McDonald
https://kylemcdonald.github.io/ethereum-emissions
https://kcimc.medium.com/ethereum-emissions-c750556e7364
**/
// avg g CO2 emitted per kWh (gCO2/kWh)
const gCO2PerKWh = 320;
// avg hashrate (MH/s) from 1W (MH/s/W)
const hashingEfficiency = 0.32;

export const calculateEmissionsFactor = (
  // total gas used in a day
  dayGasUsed: number,
  // avg hashrate in a day (GH/s)
  dayHashrate: number
) => {
  // formatting hashingEfficiency (MH/s/W -> GH/h/kWh):
  // 1. MH/s/W * 1000 -> MH/s/kW
  // 2. MH/s/kW * 3600 -> MH/h/kW
  // 3. MH/h/kW : 1000 -> GH/h/kW
  const formattedHashingEfficiency = (hashingEfficiency * 1000 * 3600) / 1000;

  // total # of hashes in a day (GH)
  const dayTotalHashes = dayHashrate * 86400;
  // total energy used in a day (GWh)
  const dayEnergyUsedKWh = dayTotalHashes / formattedHashingEfficiency;
  // total emissions in a day (gCO2)
  const emissionsGCO2 = dayEnergyUsedKWh * gCO2PerKWh;
  // emissionsFactor (gCO2/gas)
  const emissionsFactor = emissionsGCO2 / dayGasUsed;
  return emissionsFactor;
};
