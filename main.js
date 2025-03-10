const { walletFromMnemonic } = require("minterjs-wallet");
const axios = require("axios");
const fs = require("fs");
const { checkBalance } = require("minter-wallet/minterjs");


const seeds = fs
  .readFileSync("base/seeds.txt", "utf8")
  .split("\n")
  .map((line) => line.trim())
  .filter(Boolean);

// BALANCE CHECK STRUCTUR
async function checkBalanceForAddress(address) {
  try {
    const response = await axios.get(
      `https://explorer-api.minter.network/api/v2/addresses/${address}?with_sum=true`
    );
    const data = response.data.data;
    const balance = parseFloat(data.total_balance_sum_usd);
    const stake = parseFloat(data.stake_balance_sum_usd);

    // BALANCE INFO
    console.log(`Address: ${address}`);
    console.log(`Tokens: ${balance}`);
    console.log(`Staking: ${stake}`);

    // WRITE BALANCE
    if (balance > 0) {
      fs.appendFileSync("balance/minter_usd.txt", `${address} ${balance}\n`);
    }
    if (stake > 0) {
      fs.appendFileSync("balance/stake_usd.txt", `${address} ${stake}\n`);
    }
  } catch (error) {
    console.error(`Error checking balance for ${address}:`, error.message);
  }
}

// PROCESS CHECKING
async function processSeeds() {
  
  await Promise.allSettled([
    checkBalance(seeds),
    (async () => {
      for (const seed of seeds) {
        try {
          const wallet = walletFromMnemonic(seed);
          const address = wallet.getAddressString();
          await checkBalanceForAddress(address); 
        } catch (error) {
          console.error(`Invalid seed ${seed}:`, error.message);
        }
      }
    })(),
  ]);
}


processSeeds();
