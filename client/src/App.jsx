import React, { useState, useEffect } from 'react';
import { ReactFlow } from '@xyflow/react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';

import '@xyflow/react/dist/style.css';
import NodeMap from './NodeMap';

const initialNodes = [
  { id: '1', position: { x: 0, y: 0 }, data: { label: '1' } },
  { id: '2', position: { x: 0, y: 100 }, data: { label: '2' } },
];
const initialEdges = [{ id: 'e1-2', source: '1', target: '2' }];

export default function App() {
  // return (
  //   <div style={{ width: '100vw', height: '100vh' }}>
  //     <ReactFlow nodes={initialNodes} edges={initialEdges} />
  //   </div>
  // );
  // const [data, setData] = useState([]);

  // useEffect(() => {
  //   fetch('/api/data')
  //     .then(response => response.json())
  //     .then(data => setData(data));
  // }, []);

  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path='nodes/:hostname' element={<NodeMap />}>
          </Route>
        </Routes>
      </BrowserRouter>
    </div>
  );
}