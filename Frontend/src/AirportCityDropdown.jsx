import Select from "react-select";
import { useState } from "react";
import airports from "./data/airports.json";

function AirportCityDropdown({ label, onSelect }) {
  const [options, setOptions] = useState([]);

  const handleSearch = (inputValue) => {
    if (!inputValue) return;
    const filtered = airports
  .filter((item) => {
    const search = inputValue.toLowerCase();

    return (
      item.city?.toLowerCase().startsWith(search) ||
      item.airportName?.toLowerCase().includes(search) ||
      item.code?.toLowerCase().startsWith(search)
    );
  })
  .slice(0, 15)
  .map((item) => ({
    value: item.code,
    label: `${item.airportName} (${item.code}) - ${item.city}, ${item.country}`
  }));

    setOptions(filtered);
  };

  return (
    <div style={{ marginBottom: "20px" }}>
      <label style={{ fontWeight: "bold" }}>{label}</label>

      <Select
        options={options}
        onInputChange={handleSearch}
        onChange={(selected) => onSelect(selected.value)}
        placeholder="Type city or airport..."
        isSearchable
      />
    </div>
  );
}

export default AirportCityDropdown;