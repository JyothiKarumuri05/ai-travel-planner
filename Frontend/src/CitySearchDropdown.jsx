import Select from "react-select";
import { useState } from "react";
import airports from "./data/airports.json";  // LOCAL FILE

function CitySearchDropdown({ label, onSelect }) {

  const [options, setOptions] = useState([]);

  const handleSearch = (inputValue) => {
    if (!inputValue) return;

    const filtered = airports
      .filter(
        (item) =>
          item.city?.toLowerCase().includes(inputValue.toLowerCase()) ||
          item.airportName?.toLowerCase().includes(inputValue.toLowerCase())
      )
      .slice(0, 20) // limit results
      .map((item) => ({
        value: item.code,
        label: `${item.airportName} (${item.code}) - ${item.city}`
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

export default CitySearchDropdown;