const amadeus = require("../services/amadeusService");

exports.flightAvailability = async (req, res) => {
  try {

    const { originLocationCode,
            destinationLocationCode,
            departureDate } = req.body;

    const response =
      await amadeus.shopping.flightOffersSearch.get({
        originLocationCode,
        destinationLocationCode,
        departureDate,
        adults: 1
      });

    res.json(response.data);

  } catch (error) {
    console.error("FLIGHT ERROR:", error.response?.result || error);
    res.status(500).json(error.response?.result || error.message);
  }
};


exports.searchHotelsByCityName = async (req, res) => {
  try {
    const { cityName } = req.body;

    // 1️⃣ Convert city name to city code
    const cityResponse = await amadeus.referenceData.locations.get({
      keyword: cityName,
      subType: "CITY"
    });

    if (!cityResponse.data.length) {
      return res.status(404).json({ error: "City not found" });
    }

    const cityCode = cityResponse.data[0].iataCode;

    // 2️⃣ Search hotels using city code
    const hotelResponse =
      await amadeus.referenceData.locations.hotels.byCity.get({
        cityCode: cityCode
      });

    res.json({
      city: cityName,
      cityCode: cityCode,
      hotels: hotelResponse.data
    });

  } catch (error) {
    console.error("HOTEL SEARCH ERROR:", error.response?.result || error);
    res.status(500).json(error.response?.result || error.message);
  }
};