import { useEffect, useState } from "react";
import api from "../../lib/axios";
import L from "leaflet";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Circle,
  useMapEvents,
} from "react-leaflet";
import ReportIssueModal from "./ReportIssueModal";

const createIcon = (color) =>
  new L.Icon({
    iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-${color}.png`,
    shadowUrl:
      "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
  });

const redIcon = createIcon("red");
const orangeIcon = createIcon("orange");
const yellowIcon = createIcon("yellow");

function getIcon(severity) {
  if (severity === "high") return redIcon;
  if (severity === "medium") return orangeIcon;
  return yellowIcon;
}

function getRadius(severity) {
  if (severity === "high") return 120;
  if (severity === "medium") return 80;
  return 50;
}

function getColor(severity) {
  if (severity === "high") return "#ef4444";
  if (severity === "medium") return "#f97316";
  return "#eab308";
}

function ClickHandler({ onPick }) {
  useMapEvents({
    click(e) {
      onPick(e.latlng);
    },
  });
  return null;
}

export default function LiveMap() {
  const [reports, setReports] = useState([]);
  const [modal, setModal] = useState(false);
  const [position, setPosition] = useState(null);

  const fetchReports = async () => {
    try {
      const res = await api.get("/api/reports");
      setReports(res.data.reports || []);
    } catch {
      setReports([]);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  return (
    <>
      <div className="h-[500px] w-full overflow-hidden rounded-[28px]">
        <MapContainer
          center={[28.6139, 77.209]}
          zoom={12}
          scrollWheelZoom
          className="h-full w-full z-0"
        >
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

          <ClickHandler
            onPick={(latlng) => {
              setPosition(latlng);
              setModal(true);
            }}
          />

          {reports.map((item) => {
            const lat = item.location?.coordinates?.[1] || 28.6139;
            const lng = item.location?.coordinates?.[0] || 77.209;
            const severity = item.severity || "medium";

            return (
              <div key={item._id}>
                <Circle
                  center={[lat, lng]}
                  radius={getRadius(severity)}
                  pathOptions={{
                    fillColor: getColor(severity),
                    color: getColor(severity),
                    fillOpacity: 0.2,
                  }}
                />

                <Marker
                  position={[lat, lng]}
                  icon={getIcon(severity)}
                >
                  <Popup>
                    <div className="w-[220px]">
                      <h3 className="font-bold text-lg">
                        {item.title}
                      </h3>

                      <p className="capitalize mt-1">
                        {item.category.replace("_", " ")}
                      </p>

                      <p className="capitalize mt-1 font-semibold">
                        Priority: {severity}
                      </p>

                      <p className="capitalize mt-1 text-red-500">
                        {item.status}
                      </p>
                    </div>
                  </Popup>
                </Marker>
              </div>
            );
          })}
        </MapContainer>
      </div>

      <ReportIssueModal
        open={modal}
        onClose={() => setModal(false)}
        position={position}
        refresh={fetchReports}
      />
    </>
  );
}