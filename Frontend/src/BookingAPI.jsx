import { useState } from "react";
import airports from "./data/airports.json";
import "./BookingAPI.css";
import HotelSearch from "./HotelSearch";

function BookingAPI() {
  const [airportQuery, setAirportQuery] = useState("");
  const [filteredAirports, setFilteredAirports] = useState([]);
  const [hasAirportSearched, setHasAirportSearched] = useState(false);

  const [originInput, setOriginInput] = useState("");
  const [destinationInput, setDestinationInput] = useState("");
  const [date, setDate] = useState("");

  const [flights, setFlights] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasFlightSearched, setHasFlightSearched] = useState(false);

  /* ================= AIRPORT SEARCH ================= */

  const searchAirports = () => {
    if (!airportQuery.trim()) {
      alert("Enter city name or airport code");
      return;
    }

    setHasAirportSearched(true);
    const search = airportQuery.trim().toLowerCase();

    const exactCodeMatch = airports.filter(
      (airport) => airport.code?.toLowerCase() === search
    );

    if (exactCodeMatch.length > 0) {
      setFilteredAirports(exactCodeMatch);
      return;
    }

    const results = airports.filter(
      (airport) =>
        airport.city?.toLowerCase().includes(search) ||
        airport.airportName?.toLowerCase().includes(search)
    );

    setFilteredAirports(results);
  };

  /* ================= GET AIRPORT CODE ================= */

  const getAirportCode = (input) => {
    if (!input) return null;

    const value = input.trim().toLowerCase();

    const codeMatch = airports.find(
      (airport) => airport.code?.toLowerCase() === value
    );
    if (codeMatch) return codeMatch.code;

    const exactCityMatch = airports.find(
      (airport) => airport.city?.toLowerCase() === value
    );
    if (exactCityMatch) return exactCityMatch.code;

    const partialCityMatch = airports.find(
      (airport) => airport.city?.toLowerCase().includes(value)
    );
    if (partialCityMatch) return partialCityMatch.code;

    return null;
  };

  /* ================= FLIGHT SEARCH ================= */

  const searchFlights = async () => {
    if (!originInput || !destinationInput || !date) {
      alert("Please fill all flight fields");
      return;
    }

    const originCode = getAirportCode(originInput);
    const destinationCode = getAirportCode(destinationInput);

    if (!originCode || !destinationCode) {
      alert("City or airport not found in database");
      return;
    }

    if (originCode === destinationCode) {
      alert("Origin and destination cannot be same");
      return;
    }

    try {
      setLoading(true);
      setHasFlightSearched(true);

      const res = await fetch(
        "https://antonina-teetotal-celena.ngrok-free.dev/api/flight-availability",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            originLocationCode: originCode,
            destinationLocationCode: destinationCode,
            departureDate: date,
          }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        alert("Flight search failed");
        return;
      }

      const filteredFlights = (data || []).filter((flight) => {
        const segment = flight.itineraries?.[0]?.segments?.[0];
        return segment?.arrival?.iataCode === destinationCode;
      });

      setFlights(filteredFlights);
    } catch (error) {
      console.error(error);
      alert("Something went wrong while searching flights");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="booking-container">

      {/* ================= AIRPORT SEARCH ================= */}
      <div className="booking-card">
        <h2 className="booking-title">🏙 Airport & City Search</h2>

        <div className="booking-row">
          <input
            type="text"
            placeholder="Enter city or airport code"
            value={airportQuery}
            onChange={(e) => setAirportQuery(e.target.value)}
          />
        </div>

        <div className="booking-row">
          <button onClick={searchAirports}>Search Airports</button>
        </div>

        {hasAirportSearched && (
           <>
            <p className="results-count">
              {filteredAirports.length} Airports Found
            </p>
          <div className="airport-results fixed-scroll">

            {filteredAirports.length === 0 && (
              <p className="no-results">No airports found</p>
            )}

            {filteredAirports.map((airport, index) => (
              <div key={index} className="airport-item">
                ✈ {airport.airportName}
                <p>Code: {airport.code}</p>
                <p>City: {airport.city}</p>
                <p>Country: {airport.country}</p>
              </div>
            ))}

          </div>
          </>
        )}
      </div>

      {/* ================= FLIGHT SEARCH ================= */}
      <div className="booking-card">
        <h2 className="booking-title">✈ Flight Availability Search</h2>

        <div className="booking-row">
          <input
            type="text"
            placeholder="From (City Name or Code)"
            value={originInput}
            onChange={(e) => setOriginInput(e.target.value)}
          />
        </div>

        <div className="booking-row">
          <input
            type="text"
            placeholder="To (City Name or Code)"
            value={destinationInput}
            onChange={(e) => setDestinationInput(e.target.value)}
          />
        </div>

        <div className="booking-row">
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </div>

        <div className="booking-row">
          <button onClick={searchFlights} disabled={loading}>
            {loading ? "Searching..." : "Search Flights"}
          </button>
        </div>

        {hasFlightSearched && (
           <>
           <p className="results-count">
            {flights.length} Flights Found
           </p>
          <div className="flight-results fixed-scroll">

            {flights.length === 0 && !loading && (
              <p className="no-results">No flights found</p>
            )}

            {flights.map((flight, i) => {
              const segment = flight.itineraries?.[0]?.segments?.[0];

              const departureCity =
                airports.find(
                  (a) => a.code === segment?.departure?.iataCode
                )?.city || segment?.departure?.iataCode;

              const arrivalCity =
                airports.find(
                  (a) => a.code === segment?.arrival?.iataCode
                )?.city || segment?.arrival?.iataCode;

              return (
                <div key={i} className="flight-card">
                  <p>
                    ✈ Airline: {segment?.carrierCode || "N/A"}{" "}
                    {segment?.number || ""}
                  </p>
                  <p>{departureCity} → {arrivalCity}</p>
                  <p>Departure: {segment?.departure?.at || "N/A"}</p>
                  <p>Arrival: {segment?.arrival?.at || "N/A"}</p>
                  <p>
                    💰 {flight.price?.total || "N/A"}{" "}
                    {flight.price?.currency || ""}
                  </p>
                </div>
              );
            })}

          </div>
          </>
        )}
      </div>

      <HotelSearch />
    </div>
  );
}

export default BookingAPI;