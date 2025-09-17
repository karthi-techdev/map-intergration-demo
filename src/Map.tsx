import { useState, useEffect } from "react";
import type { FC } from "react";
import Map, { NavigationControl, Marker, Popup } from "react-map-gl/maplibre";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

interface MapInterfaceProps {
  center?: [number, number];
  zoom?: number;
  height?: string;
  width?: string;
  styleUrl?: string;
}

const property = {
  id: 1,
  title: "Focus Media, Medavakkam Flyover",
  type: "Unipole",
  rating: 9.5,
  coords: [80.209, 12.917], // Chennai sample [lng, lat]
  image:
    "https://5.imimg.com/data5/ANDROID/Default/2022/10/KB/MB/ID/8895765/product-jpeg.jpg",
};

const MapInterface: FC<MapInterfaceProps> = ({
  center = [80.209, 12.917],
  zoom = 13,
  height = "100vh",
  width = "100vw",
  styleUrl = "/bookadzone-map-style.json",
}) => {
  const [hovered, setHovered] = useState(false);
  const [selected, setSelected] = useState(false);
  const [pointerVisible, setPointerVisible] = useState(false);
  const [pointerAnimating, setPointerAnimating] = useState(false);

  const showPointer = hovered || selected;

  // Handle pointer animation when hovered or selected
  useEffect(() => {
    if (showPointer && !pointerVisible && !pointerAnimating) {
      setPointerAnimating(true);
      setPointerVisible(true);
      setTimeout(() => setPointerAnimating(false), 300);
    } else if (!showPointer && pointerVisible && !pointerAnimating) {
      setPointerAnimating(true);
      setTimeout(() => {
        setPointerVisible(false);
        setPointerAnimating(false);
      }, 300);
    }
  }, [showPointer, pointerVisible, pointerAnimating]);

  // Close popup when clicking on the map
  useEffect(() => {
    const handleMapClick = () => {
      if (selected) {
        setSelected(false);
        setHovered(false);
      }
    };

    // Add event listener to the map container
    const mapContainer = document.querySelector('.map-container');
    if (mapContainer) {
      mapContainer.addEventListener('click', handleMapClick);
    }

    return () => {
      if (mapContainer) {
        mapContainer.removeEventListener('click', handleMapClick);
      }
    };
  }, [selected]);

  return (
    <div className="map-container">
      <Map
        mapLib={maplibregl}
        initialViewState={{
          longitude: center[0],
          latitude: center[1],
          zoom,
        }}
        style={{ height, width }}
        mapStyle={styleUrl}
      >
        <NavigationControl position="top-right" />

        {/* Marker */}
        <Marker
          longitude={property.coords[0]}
          latitude={property.coords[1]}
          anchor="center"
        >
          <div
            className="marker-container"
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => !selected && setHovered(false)}
            onClick={(e) => {
              e.stopPropagation();
              setSelected(true);
            }}
          >
            {/* Ripple effect when hovered or selected */}
            {(hovered || selected) && (
              <div className="marker-ripple"></div>
            )}
            
            {/* Dot with size change on hover/selection */}
            <div className={`marker-dot ${hovered || selected ? 'expanded' : ''}`}></div>

            {/* Location pointer with smooth animation */}
            {pointerVisible && (
              <div className={`marker-pointer ${showPointer ? 'active' : 'inactive'}`}>
                <img src={property.image} alt="Billboard" />
              </div>
            )}
          </div>
        </Marker>

        {/* Popup */}
        {selected && (
          <Popup
            longitude={property.coords[0]}
            latitude={property.coords[1]}
            onClose={() => {
              setSelected(false);
              setHovered(false);
            }}
            anchor="top"
            closeOnClick={false}
            closeButton={true}
            closeOnMove={false}
          >
            <div className="popup-card">
              <img src={property.image} alt="billboard" className="popup-img" />
              <h3>{property.title}</h3>
              <p>
                {property.type}{" "}
                <span className="stars">⭐⭐⭐⭐⭐</span>{" "}
                <span className="rating">{property.rating}</span>
              </p>
              <button className="book-btn">Book Now</button>
            </div>
          </Popup>
        )}
      </Map>
    </div>
  );
};

export default MapInterface;