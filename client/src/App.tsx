import NodeMap from './NodeMap'
import { BrowserRouter, Route, Routes } from 'react-router-dom'

export default function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path='node/:hostname' element={<NodeMap />}>
          </Route>
        </Routes>
      </BrowserRouter>
    </>
  )
}