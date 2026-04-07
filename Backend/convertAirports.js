// const fs = require("fs");
// const csv = require("csv-parser");

// const results = [];
// const uniqueCities = new Map();

// fs.createReadStream("airport-codes.csv")
//   .pipe(csv())
//   .on("data", (data) => {
//     if ( data.iata_code  &&  data.type === "large_airport")
//       {
//       const city = data.municipality;
//       const code = data.iata_code;
//       const country = data.iso_country;

//       if (city && !uniqueCities.has(code)) {
//         uniqueCities.set(code, {
//           city,
//           code,
//           country,
//         });
//       }
//     }
//   })
//   .on("end", () => {
//     const cleanData = Array.from(uniqueCities.values());

//     fs.writeFileSync(
//       "cityCodes.json",
//       JSON.stringify(cleanData, null, 2)
//     );

//     console.log("✅ cityCodes.json created successfully!");
//   });


const fs = require("fs");
const csv = require("csv-parser");

const airports = [];

fs.createReadStream("airport-codes.csv")
  .pipe(csv())
  .on("data", (data) => {
    if (
      data.iata_code &&
      data.iata_code.trim() !== "" &&
      data.municipality
    ) {
      airports.push({
        airportName: data.name,
        city: data.municipality,
        code: data.iata_code,
        country: data.iso_country,
      });
    }
  })
  .on("end", () => {
    fs.writeFileSync(
      "airports.json",
      JSON.stringify(airports, null, 2)
    );

    console.log("✅ airports.json created!");
  });