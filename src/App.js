import VideoComponent from "./VideoComponent";
import HostVideoComponent from "./HostVideoComponent"
import { WebinarJoiningForm } from "./WebinarJoiningForm/WebinarJoiningForm";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.css";

function App() {

  return (
    <div className="App">
      <Router>
        <Routes>
          <Route exact path="/" element={<WebinarJoiningForm />}></Route>
          <Route exact path="/webinar" element={<VideoComponent />}></Route>
          <Route exact path="/webinar/guest" element={<HostVideoComponent />}></Route>
        </Routes>
      </Router>
    </div>
  );
}

export default App;
