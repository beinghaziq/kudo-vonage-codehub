import React from 'react';
import { VideoComponent } from './components/VideoComponent.jsx';
import { JoiningVideoComponent } from './components/JoiningVideoComponent.jsx';
import { WebinarJoiningForm } from './WebinarJoiningForm/WebinarJoiningForm.jsx';
import { Health } from './common/Health.jsx';

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.css';

function App() {
  return (
    <div className="App">
      <Router>
        <Routes>
          <Route exact path="/" element={<WebinarJoiningForm />} />
          <Route exact path="/webinar" element={<VideoComponent />} />
          <Route path="/_/health" component={Health} />
          <Route exact path="/webinar/guest" element={<JoiningVideoComponent />} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;
