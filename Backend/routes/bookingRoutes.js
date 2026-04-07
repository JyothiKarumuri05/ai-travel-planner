


// router.get('/airports', bookingController.searchAirports);

// router.get("/hotels", async (req, res) => {
//   try {
//     const { cityCode } = req.query;

//     // STEP 1: Get hotels by city
//     const hotelList = await amadeus.referenceData.locations.hotels.byCity.get({
//       cityCode: cityCode,
//     });

//     if (!hotelList.data || hotelList.data.length === 0) {
//       return res.json([]);
//     }

//     // Take first 5 hotels to avoid rate limit
//     const hotelIds = hotelList.data
//       .slice(0, 5)
//       .map(hotel => hotel.hotelId)
//       .join(",");

//     // STEP 2: Get hotel offers
//     const offers = await amadeus.shopping.hotelOffersSearch.get({
//       hotelIds: hotelIds,
//       checkInDate: "2026-03-01",
//       checkOutDate: "2026-03-03",
//       adults: "1",
//     });

//     res.json(offers.data);

//   } catch (error) {
//     console.error("HOTEL FULL ERROR:", error.response?.result || error);
//     res.status(500).json(error.response?.result || error.message);
//   }
// });
// router.get("/flights", async (req, res) => {
//   try {
//     const { origin, destination, date } = req.query;

//     const response = await amadeus.shopping.flightOffersSearch.get({
//       originLocationCode: origin,
//       destinationLocationCode: destination,
//       departureDate: date,
//       adults: "1",
//     });

//     res.json(response.data);
//   } catch (error) {
//     console.error("FLIGHT FULL ERROR:", error);
//     res.status(500).json(error.message);
//   }
// });

// module.exports = router;

const express = require("express");
const router = express.Router();
const bookingController = require("../controllers/bookingController");

//router.get("/airports", bookingController.searchAirports);
router.post("/flight-availability", bookingController.flightAvailability);
//router.get("/hotels", bookingController.searchHotels);
router.post("/hotels-by-city-name", bookingController.searchHotelsByCityName);
module.exports = router;