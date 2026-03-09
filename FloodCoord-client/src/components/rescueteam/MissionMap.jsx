import { MapContainer, TileLayer, Marker } from "react-leaflet";
import "leaflet/dist/leaflet.css";

export default function MissionMap({ location }) {

  const position = location
    ? [location.latitude, location.longitude]
    : [10.8431, 106.8242]; // fallback

  return (
    // THÊM: class "z-10 relative" vào thẻ bọc MapContainer để khống chế z-index
    <div className="h-full w-full z-10 relative">
      <MapContainer
        center={position}
        zoom={15}
        // STYLE: Khống chế z-index trực tiếp cho MapContainer
        style={{ height: '100%', width: '100%', zIndex: 10 }}
      >
        <TileLayer
          attribution="&copy; OpenStreetMap"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={position} />
      </MapContainer>
    </div>
  );
}