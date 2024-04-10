import React from 'react';
import { JoiningVideoComponent } from './components/JoiningVideoComponent.jsx';
import { CreateWebinarForm } from './createWebinarForm/CreateWebinarForm.jsx';
import { MeetingPage } from './meetingPage/MeetingPage.jsx';
import { Health } from './common/Health.jsx';

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.css';

function App() {
  return (
    <div className="App">
      <Router>
        <Routes>
          <Route exact path="/" element={<CreateWebinarForm />} />
          <Route exact path="/webinar" element={<MeetingPage />} />
          <Route path="/_/health" component={Health} />
          <Route exact path="/webinar/guest" element={<JoiningVideoComponent />} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;
