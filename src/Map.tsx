import { useState, useEffect, useRef } from "react";
import type { FC } from "react";
import Map, { NavigationControl, Marker, Popup } from "react-map-gl/maplibre";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { FaStar } from "react-icons/fa";
import bannerImg from './assets/banner-mock.jpg'
import { Link } from "react-router-dom";

interface MapInterfaceProps {
  center?: [number, number];
  zoom?: number;
  height?: string;
  width?: string;
  styleUrl?: string;
}

// Sample data for 10 billboard locations in Chennai
import demoData from "./demo-data.json";

const MapInterface: FC<MapInterfaceProps> = ({
  center = [80.209, 12.917],
  zoom = 11,
  height = "100vh",
  width = "100vw",
  styleUrl = "/bookadzone-map-style.json",
}) => {
  const [hoveredId, setHoveredId] = useState<number | null>(null);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [pointerVisible, setPointerVisible] = useState<Record<number, boolean>>({});
  const [pointerAnimating, setPointerAnimating] = useState<Record<number, boolean>>({});
  const [viewState, setViewState] = useState({
    longitude: center[0],
    latitude: center[1],
    zoom: zoom,
  });
  const [markerVisibility, setMarkerVisibility] = useState<Record<number, boolean>>({});
  const [markerAnimating, setMarkerAnimating] = useState<Record<number, boolean>>({});
  const [properties, setProperties] = useState<any[]>(demoData);
  const popupRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef(false);
  const mouseDownRef = useRef(false);

  // ✅ Load data from localStorage (or fallback to demo-data.json)
  useEffect(() => {
    const stored = localStorage.getItem("properties");
    if (stored) {
      setProperties(JSON.parse(stored));
    } else {
      setProperties(demoData);
    }
  }, []);

  // Initialize states for all properties
  useEffect(() => {
    const initialPointerState: Record<number, boolean> = {};
    const initialAnimatingState: Record<number, boolean> = {};
    const initialVisibilityState: Record<number, boolean> = {};
    const initialMarkerAnimState: Record<number, boolean> = {};
    
    properties.forEach(property => {
      initialPointerState[property.id] = false;
      initialAnimatingState[property.id] = false;
      initialVisibilityState[property.id] = true;
      initialMarkerAnimState[property.id] = false;
    });
    
    setPointerVisible(initialPointerState);
    setPointerAnimating(initialAnimatingState);
    setMarkerVisibility(initialVisibilityState);
    setMarkerAnimating(initialMarkerAnimState);
  }, [properties]);

  // Handle pointer animation when hovered or selected
  useEffect(() => {
    properties.forEach(property => {
      const showPointer = hoveredId === property.id || selectedId === property.id;
      
      if (showPointer && !pointerVisible[property.id] && !pointerAnimating[property.id]) {
        setPointerAnimating(prev => ({ ...prev, [property.id]: true }));
        setPointerVisible(prev => ({ ...prev, [property.id]: true }));
        
        setTimeout(() => {
          setPointerAnimating(prev => ({ ...prev, [property.id]: false }));
        }, 300);
      } else if (!showPointer && pointerVisible[property.id] && !pointerAnimating[property.id]) {
        setPointerAnimating(prev => ({ ...prev, [property.id]: true }));
        
        setTimeout(() => {
          setPointerVisible(prev => ({ ...prev, [property.id]: false }));
          setPointerAnimating(prev => ({ ...prev, [property.id]: false }));
        }, 300);
      }
    });
  }, [hoveredId, selectedId, pointerVisible, pointerAnimating, properties]);

  // Handle marker visibility based on zoom level
  useEffect(() => {
    properties.forEach(property => {
      const shouldBeVisible = shouldMarkerBeVisible(property.id, viewState.zoom);
      const isCurrentlyVisible = markerVisibility[property.id];
      
      if (shouldBeVisible !== isCurrentlyVisible && !markerAnimating[property.id]) {
        setMarkerAnimating(prev => ({ ...prev, [property.id]: true }));
        
        if (shouldBeVisible) {
          // Fade in
          setMarkerVisibility(prev => ({ ...prev, [property.id]: true }));
          setTimeout(() => {
            setMarkerAnimating(prev => ({ ...prev, [property.id]: false }));
          }, 300);
        } else {
          // Fade out
          setTimeout(() => {
            setMarkerVisibility(prev => ({ ...prev, [property.id]: false }));
            setMarkerAnimating(prev => ({ ...prev, [property.id]: false }));
          }, 300);
        }
      }
    });
  }, [viewState.zoom, markerVisibility, markerAnimating, properties]);

  // Determine if a marker should be visible based on zoom level
  const shouldMarkerBeVisible = (id: number, zoom: number) => {
    if (zoom < 10) {
      return id <= 3;
    } else if (zoom < 12) {
      return id <= 6;
    } else {
      return true;
    }
  };

  // Detect map drag events
  useEffect(() => {
    const handleMapMouseDown = () => {
      mouseDownRef.current = true;
      isDraggingRef.current = false;
    };

    const handleMapMouseMove = () => {
      if (mouseDownRef.current) {
        isDraggingRef.current = true;
      }
    };

    const handleMapMouseUp = () => {
      mouseDownRef.current = false;
    };

    const mapContainer = document.querySelector('.maplibregl-canvas-container');
    if (mapContainer) {
      mapContainer.addEventListener('mousedown', handleMapMouseDown);
      mapContainer.addEventListener('mousemove', handleMapMouseMove);
      mapContainer.addEventListener('mouseup', handleMapMouseUp);
    }

    return () => {
      if (mapContainer) {
        mapContainer.removeEventListener('mousedown', handleMapMouseDown);
        mapContainer.removeEventListener('mousemove', handleMapMouseMove);
        mapContainer.removeEventListener('mouseup', handleMapMouseUp);
      }
    };
  }, []);

  // Close popup when clicking outside of it (on mouse up, not drag)
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Only close if it's a click (not drag) and outside the popup
      if (selectedId !== null && 
          popupRef.current && 
          !popupRef.current.contains(event.target as Node) &&
          !isDraggingRef.current) {
        setSelectedId(null);
        setHoveredId(null);
      }
      // Reset dragging state
      isDraggingRef.current = false;
    };

    document.addEventListener('mouseup', handleClickOutside);
    return () => {
      document.removeEventListener('mouseup', handleClickOutside);
    };
  }, [selectedId]);

  return (
    <div className="map-container">
      <Map
        mapLib={maplibregl}
        {...viewState}
        onMove={evt => setViewState(evt.viewState)}
        style={{ height, width }}
        mapStyle={styleUrl}
      >
        <NavigationControl position="top-right" />

        {properties.map(property => {
          const showPointer = hoveredId === property.id || selectedId === property.id;
          const isVisible = markerVisibility[property.id];
          const isAnimating = markerAnimating[property.id];
          
          if (!isVisible && !isAnimating) return null;
          
          return (
            <div key={property.id}>
              <Marker
                longitude={property.coords[0]}
                latitude={property.coords[1]}
                anchor="center"
              >
                <div
                  className={`marker-container ${isVisible ? 'visible' : 'hidden'}`}
                  onMouseEnter={() => setHoveredId(property.id)}
                  onMouseLeave={() => {
                    if (selectedId !== property.id) {
                      setHoveredId(null);
                    }
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedId(property.id);
                  }}
                >
                  {(hoveredId === property.id || selectedId === property.id) && (
                    <div className="marker-ripple"></div>
                  )}
                  
                  <div className={`marker-dot ${showPointer ? 'expanded' : ''}`}></div>

                  {pointerVisible[property.id] && (
                    <div className={`marker-pointer ${showPointer ? 'active' : 'inactive'}`}>
                      <div className="round-img-pointer">
                         <img src={bannerImg} alt="Billboard" />
                      </div>
                    </div>
                  )}
                </div>
              </Marker>

              {selectedId === property.id && (
                <Popup
                  longitude={property.coords[0]}
                  latitude={property.coords[1]}
                  onClose={() => {
                    setSelectedId(null);
                    setHoveredId(null);
                  }}
                  anchor="top"
                  closeOnClick={false}
                  closeButton={true}
                  closeOnMove={false}
                >
                  <div ref={popupRef} onClick={(e) => e.stopPropagation()}>
                    <div className="popup-card">
                      <img src={bannerImg} alt="billboard" className="popup-img" />
                      <div className="info">
                        <h3>{property.title}</h3>
                        <p>
                          {property.type}{" "}
                          <span className="stars">
                            {Array.from({ length: Math.round(property.rating / 2) }).map((_, i) => (
                              <FaStar key={i} color="gold" />
                            ))}
                          </span>{" "}
                          {property.rating}
                        </p>
                      </div>
                    </div>
                    <button className="book-btn">Book Now</button>
                  </div>
                </Popup>
              )}
            </div>
          );
        })}
      </Map>

      <Link to="/add-listing" className="add-listing-btn">
        + Add New Listing
      </Link>
    </div>
  );
};

export default MapInterface;