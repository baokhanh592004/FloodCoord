import { MapContainer, TileLayer, Marker } from "react-leaflet";
import "leaflet/dist/leaflet.css";

export default function MissionMap() {

  const position = [10.8431, 106.8242]; // test location

  return (

    <MapContainer
      center={position}
      zoom={15}
      style={{ height: "350px", width: "100%" }}
    >

      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <Marker position={position} />

    </MapContainer>

  );
}