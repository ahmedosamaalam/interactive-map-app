import React, { useState } from "react";
import { MapContainer, TileLayer, Polygon, FeatureGroup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-draw/dist/leaflet.draw.css";
import { LatLngTuple, LatLngLiteral } from "leaflet";
import { EditControl } from "react-leaflet-draw";
import * as turf from "@turf/turf";

// Type for positions used in react-leaflet
export type Position = [number, number];
export type MapWithPolygonDrawerProps = {
  center?: LatLngTuple;
  zoom?: number;
};

// Helper function to convert Leaflet LatLngs to Position
const toPosition = (latlngs: LatLngLiteral[]): Position[] => {
  const positions = latlngs.map(
    (latlng) => [latlng.lat, latlng.lng] as Position
  );

  // Ensure the polygon is closed by adding the first point at the end
  if (positions.length > 0 && !isClosedPolygon(positions)) {
    positions.push(positions[0]);
  }

  return positions;
};

// Helper function to check if the polygon is closed
const isClosedPolygon = (positions: Position[]): boolean => {
  return (
    positions.length > 2 &&
    positions[0][0] === positions[positions.length - 1][0] &&
    positions[0][1] === positions[positions.length - 1][1]
  );
};

// Convert positions to GeoJSON format
const toGeoJSON = (positions: Position[]) => {
  return turf.polygon([positions]);
};

// Function to check if the new polygon intersects with existing polygons
const checkIntersections = (
  newPolygon: Position[],
  existingPolygons: Position[][]
) => {
  const newPolygonGeoJSON = toGeoJSON(newPolygon);

  // Check for intersections with existing polygons
  for (const existingPolygon of existingPolygons) {
    const existingPolygonGeoJSON = toGeoJSON(existingPolygon);
    if (turf.booleanOverlap(newPolygonGeoJSON, existingPolygonGeoJSON)) {
      return true; // Intersection detected
    }
  }
  return false; // No intersection
};

const PolygonDrawer: React.FC = () => {
  const [positions, setPositions] = useState<Position[]>([]);
  const [polygons, setPolygons] = useState<Position[][]>([]);
  const [intersecting, setIntersecting] = useState<boolean>(false);

  // Handler for when the polygon is created
  const handleCreated = (e: any) => {
    const { layer } = e;
    const newPositions = toPosition(layer.getLatLngs()[0]);

    setPolygons((prevPolygons) => {
      if (checkIntersections(newPositions, prevPolygons)) {
        setIntersecting(true); // Indicate intersection
        return prevPolygons; // Do not update the state
      } else {
        setIntersecting(false);
        return [...prevPolygons, newPositions];
      }
    });

    setPositions(newPositions);
  };

  // Handler for when a shape is deleted
  const handleDeleted = () => {
    setPositions([]);
    setPolygons([]);
    setIntersecting(false);
  };

  // Handler for when a shape is edited
  const handleEdited = (e: any) => {
    const layers = e.layers;
    const updatedPolygons: Position[][] = [];
    const newPolygons: Position[][] = [];

    // Collect all updated polygons
    layers.eachLayer((layer: any) => {
      const updatedPositions = toPosition(layer.getLatLngs()[0]);
      newPolygons.push(updatedPositions);
    });

    // Check for intersections among updated polygons
    let hasIntersection = false;
    for (let i = 0; i < newPolygons.length; i++) {
      for (let j = i + 1; j < newPolygons.length; j++) {
        if (checkIntersections(newPolygons[i], [newPolygons[j]])) {
          hasIntersection = true;
          break;
        }
      }
      if (hasIntersection) break;
    }

    if (!hasIntersection) {
      setPolygons(newPolygons);
    }

    setPositions(newPolygons.flat());

    setIntersecting(hasIntersection);
  };

  return (
    <FeatureGroup>
      <EditControl
        position="topright"
        onCreated={handleCreated}
        onDeleted={handleDeleted}
        onEdited={handleEdited}
        draw={{
          polyline: false,
          polygon: true,
          circle: false,
          rectangle: false,
          marker: false,
          circlemarker: false,
        }}
        edit={{
          edit: true,
          remove: true,
        }}
      />

      {positions.length > 0 && (
        <Polygon
          positions={positions}
          pathOptions={{ color: intersecting ? "red" : "blue" }}
        />
      )}
    </FeatureGroup>
  );
};

const MapWithPolygonDrawer: React.FC<MapWithPolygonDrawerProps> = (props) => {
  return (
    <MapContainer
      center={props.center || [24.8607, 67.0099]}
      zoom={props.zoom || 13}
      {...props}
      style={{ height: "100vh", width: "100%" }}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      <PolygonDrawer />
    </MapContainer>
  );
};

export default MapWithPolygonDrawer;
