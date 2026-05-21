import {
  MapContainer,
  TileLayer,
  Marker,
  Circle,
  useMapEvents,
  useMap,
} from "react-leaflet";

import { GeoSearchControl, OpenStreetMapProvider } from "leaflet-geosearch";

import { useEffect } from "react";

import L from "leaflet";

import "leaflet/dist/leaflet.css";

delete (L.Icon.Default.prototype as any)._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",

  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",

  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

interface Props {
  latitude: number;
  longitude: number;
  radius: number;

  onChange: (lat: number, lng: number) => void;
}

const SearchField = ({
  onChange,
}: {
  onChange: (lat: number, lng: number) => void;
}) => {
  const map = useMap();

  useEffect(() => {
    const provider = new OpenStreetMapProvider();

    const searchControl = new (GeoSearchControl as any)({
      provider,

      style: "bar",

      autoComplete: true,

      autoCompleteDelay: 250,

      showMarker: false,

      showPopup: false,

      animateZoom: true,

      keepResult: true,
    });

    map.addControl(searchControl);

    map.on("geosearch/showlocation", (result: any) => {
      const lat = result.location.y;

      const lng = result.location.x;

      onChange(lat, lng);

      map.setView([lat, lng], 16);
    });

    return () => {
      map.removeControl(searchControl);
    };
  }, [map, onChange]);

  return null;
};

const RecenterMap = ({
  latitude,
  longitude,
}: {
  latitude: number;
  longitude: number;
}) => {
  const map = useMap();

  useEffect(() => {
    map.setView([latitude, longitude], 16);
  }, [latitude, longitude, map]);

  return null;
};

const LocationMarker = ({ onChange }: any) => {
  useMapEvents({
    click(e) {
      onChange(e.latlng.lat, e.latlng.lng);
    },
  });

  return null;
};

export default function GeoFenceMap({
  latitude,
  longitude,
  radius,
  onChange,
}: Props) {
  return (
    <MapContainer
      center={[latitude, longitude]}
      zoom={16}
      style={{
        height: "450px",
        width: "100%",
      }}
    >
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

      <SearchField onChange={onChange} />
      <RecenterMap latitude={latitude} longitude={longitude} />

      <Marker position={[latitude, longitude]} />

      <Circle
        center={[latitude, longitude]}
        radius={radius}
        pathOptions={{
          color: "#2563eb",
          fillColor: "#2563eb",
          fillOpacity: 0.2,
        }}
      />

      <LocationMarker onChange={onChange} />
    </MapContainer>
  );
}
