import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Map, { Marker, NavigationControl } from "react-map-gl/maplibre";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import demoData from "./demo-data.json";

const AddListing = () => {
  const navigate = useNavigate();
  const [properties, setProperties] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    title: "",
    type: "",
    rating: "",
    coords: [80.209, 12.917],
  });
  const [markerPosition, setMarkerPosition] = useState<[number, number]>([80.209, 12.917]);

  // Load properties from localStorage or demo-data.json
  useEffect(() => {
    const saved = localStorage.getItem("properties");
    if (saved) {
      setProperties(JSON.parse(saved));
    } else {
      setProperties(demoData);
    }
  }, []);

  const handleInputChange = (e: any) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleMapClick = (e: any) => {
    const { lng, lat } = e.lngLat;
    setMarkerPosition([lng, lat]);
    setFormData(prev => ({
      ...prev,
      coords: [lng, lat]
    }));
  };

  const handleSubmit = (e: any) => {
    e.preventDefault();

    const newListing = {
      id: properties.length + 1,
      title: formData.title,
      type: formData.type,
      rating: parseFloat(formData.rating),
      coords: formData.coords,
      image: "banner-mock.jpg"
    };

    const updated = [...properties, newListing];
    setProperties(updated);
    localStorage.setItem("properties", JSON.stringify(updated));

    alert("Listing added successfully!");
    navigate("/");
  };

  return (
    <div className="add-listing-container">
      <h1>Add New Billboard Listing</h1>
      
      <form onSubmit={handleSubmit} className="listing-form">
        <div className="form-group">
          <label htmlFor="title">Title:</label>
          <input type="text" id="title" name="title"
            value={formData.title} onChange={handleInputChange} required />
        </div>

        <div className="form-group">
          <label htmlFor="type">Type:</label>
          <select id="type" name="type" value={formData.type} onChange={handleInputChange} required>
            <option value="">Select Type</option>
            <option value="Unipole">Unipole</option>
            <option value="Gantry">Gantry</option>
            <option value="Digital Billboard">Digital Billboard</option>
            <option value="Hoarding">Hoarding</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="rating">Rating (0-10):</label>
          <input type="number" id="rating" name="rating"
            min="0" max="10" step="0.1"
            value={formData.rating} onChange={handleInputChange} required />
        </div>

        <div className="form-group">
          <label>Location Coordinates:</label>
          <div className="coordinates-display">
            Longitude: {formData.coords[0].toFixed(6)}, Latitude: {formData.coords[1].toFixed(6)}
          </div>
          <p className="instruction">Click on the map below to set the location</p>
        </div>

        <div className="map-picker">
          <Map
            mapLib={maplibregl}
            initialViewState={{
              longitude: 80.209,
              latitude: 12.917,
              zoom: 11,
            }}
            style={{ width: '100%', height: '400px' }}
            mapStyle="/bookadzone-map-style.json"
            onClick={handleMapClick}
          >
            <NavigationControl position="top-right" />
            <Marker longitude={markerPosition[0]} latitude={markerPosition[1]} anchor="center">
              <div className="marker-dot-picker"></div>
            </Marker>
          </Map>
        </div>

        <div className="form-actions">
          <button type="button" onClick={() => navigate("/")} className="cancel-btn">Cancel</button>
          <button type="submit" className="submit-btn">Add Listing</button>
        </div>
      </form>
    </div>
  );
};

export default AddListing;
