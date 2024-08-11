import MapWithPolygonDrawer from "./Map";
import { Meta, StoryObj } from "@storybook/react";

const meta = {
  title: "MapWithPolygonDrawer",
  component: MapWithPolygonDrawer,
} as Meta;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    center: [33.7294, 73.0931],
    zoom: 1,
  },
};
