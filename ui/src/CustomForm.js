import React, { useState } from "react";
import "./App.css";

function Form() {
  const [Name, setName] = useState("");
  const [Latitude, setLatitude] = useState("");
  const [Longitude, setLongitude] = useState("");

return (
    <form className="form">
      <input
        value={Name}
        onChange={e => setName(e.target.value)}
        placeholder="Name"
        type="text"
        name="Name"
        required
      />
      <input
        value={Latitude}
        onChange={e => setLatitude(e.target.value)}
        placeholder="Latitude"
        type="text"
        name="Latitude"
        required
      />
      <input
        value={Longitude}
        onChange={e => setLongitude(e.target.value)}
        placeholder="Longitude"
        type="Longitude"
        name="Longitude"
        required
      />
    <button type="submit">Submit</button>
  </form>
  );

}export default Form;