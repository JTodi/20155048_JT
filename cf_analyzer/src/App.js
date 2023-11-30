import React from 'react'
import { BrowserRouter,Routes,Route } from 'react-router-dom'
import Home from './Home'
import User from './User'

const App = () => {
  return (
    <div>
      <BrowserRouter>
        <Routes>
          <Route exact path="/" element={<Home/>}/>
          <Route exact path="/user" element={<User/>}/>
        </Routes>
      </BrowserRouter>
    </div>
  )
}

export default App