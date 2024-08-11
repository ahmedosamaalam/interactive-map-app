# Interactive Map Application with Polygon Drawing and Editing  

## Assignment Description  

This project is an interactive web application that allows users to draw, edit, and manipulate polygons on a map using React and TypeScript. The application employs the Leaflet library for handling map interactions and uses Open Street Map as the tile provider.  

## Table of Contents  

- [Features](#features)  
- [Technologies Used](#technologies-used)  
- [Getting Started](#getting-started)  
  - [Installation](#installation)  
  - [Running the Application](#running-the-application)  
  - [Running Storybook](#running-storybook)   

## Features  

- Interactive Leaflet map with Open Street Map tiles  
- Ability to draw polygons by clicking to create vertices  
- Real-time display of polygons being drawn  
- Vertex manipulation: dragging, adding, and removing vertices of polygons  
- Intersection detection to ensure no polygons overlap  
- Clearly defined edit modes and visual feedback upon editing  
- Integration with Storybook for components' demonstration  

## Technologies Used  

- **React**: JavaScript library for building user interfaces.  
- **TypeScript**: Adds type safety to the JavaScript codebase.  
- **Leaflet**: Library for interactive maps.  
- **Open Street Map**: Tile provider for the map background.  
- **Storybook**: Tool for developing UI components in isolation.  

## Getting Started  

### Installation  

1. Clone the repository:  
    ```bash  
    git clone https://github.com/ahmedosamaalam/interactive-map-app  
    ```  

2. Navigate to the project directory:  
    ```bash  
    cd interactive-map-app  
    ```  

3. Install the dependencies:  
    ```bash  
    npm install  
    ```  
    or  
    ```bash  
    yarn install  
    ```  

### Running the Application and Storybook 

To start the development server ans storybook server, use the following command:  
```bash  
npm start
npm run storybook  
