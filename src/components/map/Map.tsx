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

// Helper function to convert Leaflet LatLngs to LatLngTuple
const toLatLngTuple = (latlngs: any): LatLngTuple[] =>
  latlngs.map((latlng: any) => [latlng.lat, latlng.lng]);

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
): number | null => {
  const newPolygonGeoJSON = toGeoJSON(newPolygon);

  // Check for intersections with existing polygons
  for (let i = 0; i < existingPolygons.length; i++) {
    const existingPolygonGeoJSON = toGeoJSON(existingPolygons[i]);
    if (
      turf.booleanOverlap(newPolygonGeoJSON, existingPolygonGeoJSON) ||
      turf.booleanCrosses(newPolygonGeoJSON, existingPolygonGeoJSON) ||
      turf.booleanIntersects(newPolygonGeoJSON, existingPolygonGeoJSON)
    ) {
      return i; // Return index of intersecting polygon
    }
  }
  return null; // No intersection
};

const PolygonDrawer: React.FC = () => {
  const [polygons, setPolygons] = useState<Position[][]>([]);
  const [intersectingIndex, setIntersectingIndex] = useState<number | null>(
    null
  );
  const [intersectingIndices, setIntersectingIndices] = useState<number[]>([]);

  // Handler for when the polygon is created
  const handleCreated = (e: any) => {
    const { layer } = e;
    const newPositions = toPosition(layer.getLatLngs()[0]);

    setPolygons((prevPolygons) => {
      const intersectionIndex = checkIntersections(newPositions, prevPolygons);
      if (intersectionIndex !== null) {
        setIntersectingIndex(prevPolygons.length); // Indicate intersection at new polygon index
        setIntersectingIndices([intersectionIndex, polygons.length]); // Set indices of intersecting polygons
        return [...prevPolygons, newPositions]; // Add new polygon but mark it as intersecting
      } else {
        setIntersectingIndex(null);
        setIntersectingIndices([]); // No intersections
        return [...prevPolygons, newPositions];
      }
    });
    setIntersectingIndices([]);
  };

  // Handler for when a shape is deleted
  const handleDeleted = (e: any) => {
    const layers = e.layers;
    const remainingPolygons: Position[][] = [];

    // Remove the deleted layers from the current polygons
    polygons.forEach((polygon) => {
      const layerPositions = layers
        .getLayers()
        .map((layer: any) => toPosition(layer.getLatLngs()[0]));
      const isDeleted = layerPositions.some(
        (deletedPositions: any) =>
          JSON.stringify(polygon) === JSON.stringify(deletedPositions)
      );
      if (!isDeleted) {
        remainingPolygons.push(polygon);
      }
    });

    setPolygons(remainingPolygons);
    setIntersectingIndex(null);
  };

  // Handler for when a shape is edited
  const handleEdited = (e: any) => {
    const editedLayers = e.layers.getLayers();
    const updatedPolygons = [...polygons];

    editedLayers.forEach((layer: any) => {
      const updatedPositions = toPosition(layer.getLatLngs()[0]);
      const index = polygons.findIndex(
        (polygon) =>
          JSON.stringify(polygon) ===
          JSON.stringify(toPosition(layer.getLatLngs()[0]))
      );

      // Update only if index is found
      if (index !== -1) {
        updatedPolygons[index] = updatedPositions;
      }
    });

    // Re-check intersections among all polygons
    const intersectingIndices = [];
    for (let i = 0; i < updatedPolygons.length; i++) {
      const intersectionIndex = checkIntersections(
        updatedPolygons[i],
        updatedPolygons.filter((_, idx) => idx !== i)
      );
      if (intersectionIndex !== null) {
        intersectingIndices.push(i); // Add intersecting polygon index
      }
    }

    setIntersectingIndices(intersectingIndices);
    setPolygons(updatedPolygons);
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

      {polygons.map((polygon, index) => (
        <Polygon
          key={index}
          positions={polygon}
          pathOptions={{ color: intersectingIndex === index ? "red" : "blue" }}
        />
      ))}
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
