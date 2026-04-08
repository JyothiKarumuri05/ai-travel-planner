import { useState } from "react";
import "./BookingAPI.css";
function HotelSearch() {
  const [cityName, setCityName] = useState("");
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const searchHotels = async () => {
    if (!cityName.trim()) {
      alert("Please enter a city name");
      return;
    }
    try {
      setLoading(true);
      setHasSearched(true);
      const res = await fetch(
        "https://antonina-teetotal-celena.ngrok-free.dev/api/hotels-by-city-name",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ cityName })
        }
      );
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "Hotel search failed");
        return;
      }
      setHotels(data.hotels || []);
    } catch (error) {
      console.error(error);
      alert("Something went wrong");
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="booking-card modern-card">

      <h2 className="section-title">🏨 Hotel Search</h2>

      <div className="booking-row">
        <input
          type="text"
          placeholder="Enter City Name "
          value={cityName}
          onChange={(e) => setCityName(e.target.value)}
        />
        <button onClick={searchHotels} disabled={loading}>
          {loading ? "Searching..." : "Search Hotels"}
        </button>
      </div>

      {hasSearched && (
        <>
          <p className="results-count">
            {hotels.length} Hotels Found
          </p>

          <div className="results-grid fixed-scroll">

            {hotels.length === 0 && !loading && (
              <p className="no-results">No hotels found</p>
            )}

            {hotels.map((hotel, index) => (
              <div key={index} className="result-card">
                <h4>{hotel.name}</h4>
                <p>{hotel.address?.cityName}</p>
                <p>{hotel.address?.countryCode}</p>
              </div>
            ))}

          </div>
        </>
      )}

    </div>
  );
}

export default HotelSearch;