import http from "http";

const PORT =
Number(process.env.PORT) || 3000;

const TOKEN =
"f4fd5751ea7bcf8cbd049b3345222e62adb19cb3cd0eee51bb09f2af98f7d76b7ece1e0e89dea30810d96c27ab2945b6";

const COOKIE =
"YOUR_COOKIE";

const OUTCOME_ID =
"42a77638-c0f4-4afe-a078-daaf555911c2";

let latestText =
"Loading odds...";

async function updateOdds() {

  try {

    const response =
    await fetch(

      "https://stake.com/_api/graphql",

      {

        method: "POST",

        headers: {

          "User-Agent":
          "Mozilla/5.0",

          "Content-Type":
          "application/json",

          "x-operation-type":
          "query",

          "x-operation-name":
          "SportBet_SportMarketOutcome",

          "x-language":
          "en",

          "x-access-token":
          TOKEN,

          "cookie":
          COOKIE
        },

        body: JSON.stringify({

          query: `
            query SportBet_SportMarketOutcome(
              $outcomeId: String!,
              $provider: SportsbookOddsProviderEnum!
            ) {

              sportMarketOutcome(
                outcomeId: $outcomeId,
                provider: $provider
              ) {

                name
                odds

                market {

                  fixture {

                    data {

                      ... on SportFixtureDataMatch {

                        competitors {
                          name
                        }
                      }
                    }
                  }
                }
              }
            }
          `,

          variables: {

            outcomeId: OUTCOME_ID,

            provider: "betradar"
          }
        })
      }
    );

    const json =
    await response.json();

    if (
      !json.data ||
      !json.data.sportMarketOutcome
    ) {

      latestText =
      "No data";

      return;
    }

    const outcome =
    json.data.sportMarketOutcome;

    const odds =
    outcome.odds;

    const teams =
    outcome.market.fixture
    .data.competitors;

    latestText = `

TEAM 1:
${teams[0].name}

TEAM 2:
${teams[1].name}

PICK:
${outcome.name}

ODDS:
${odds}

UPDATED:
${new Date().toLocaleTimeString()}
`;

    console.log(latestText);

  } catch (err: any) {

    latestText =
    "ERROR: " + err.message;

    console.log(err.message);
  }
}

// UPDATE EVERY 30 SEC

updateOdds();

setInterval(
  updateOdds,
  30000
);

// WEBSITE

http.createServer((req, res) => {

  res.writeHead(200, {
    "Content-Type":
    "text/plain"
  });

  res.end(latestText);

}).listen(PORT, () => {

  console.log(
  "Server running on port",
  PORT);

});
