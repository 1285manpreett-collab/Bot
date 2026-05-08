import TelegramBot from "node-telegram-bot-api";
import http from "http";

// KEEP-ALIVE SERVER

http.createServer((req, res) => {
  res.end("Bot Running");
}).listen(process.env.PORT || 3000);

// SETTINGS

const INTERVAL_MS = 30000;

const TOKEN =
"f4fd5751ea7bcf8cbd049b3345222e62adb19cb3cd0eee51bb09f2af98f7d76b7ece1e0e89dea30810d96c27ab2945b6";

const COOKIE =
"YOUR_COOKIE";

const OUTCOME_ID =
"42a77638-c0f4-4afe-a078-daaf555911c2";

const TARGET_ODDS = 1.0;

// BOT

export function startBot(): void {

  const telegramToken =
  process.env["8696233281:AAFMq_ijIOg6IwmTltClqU3v2Nbr1lWHfy8"];

  if (!telegramToken) {

    console.log(
      "Missing Telegram token"
    );

    return;
  }

  const bot =
  new TelegramBot(
    telegramToken,
    { polling: true }
  );

  async function checkOdds(
    chatId: number
  ) {

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
        return;
      }

      const outcome =
      json.data.sportMarketOutcome;

      const odds =
      outcome.odds;

      const teams =
      outcome.market.fixture
      .data.competitors;

      console.log(
      "ODDS:",
      odds);

      if (
        odds >= TARGET_ODDS
      ) {

        const msg =

`TARGET ODDS HIT!

${teams[0].name}
vs
${teams[1].name}

PICK:
${outcome.name}

ODDS:
${odds}`;

        await bot.sendMessage(
          chatId,
          msg
        );

        console.log(
        "ALERT SENT");
      }

    } catch (err: any) {

      console.log(
      err.message);

    }
  }

  bot.onText(/\/start/, (msg) => {

    const chatId =
    msg.chat.id;

    bot.sendMessage(
      chatId,
      "Odds tracker started."
    );

    checkOdds(chatId);

    setInterval(() => {

      checkOdds(chatId);

    }, INTERVAL_MS);
  });

  console.log(
  "Telegram bot started");
}
