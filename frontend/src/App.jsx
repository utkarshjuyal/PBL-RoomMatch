import {
    BrowserRouter,
    Routes,
    Route
} from "react-router-dom";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Profile from "./pages/Profile";
import Preferences from "./pages/Preferences";

const Home = () => {
    return (
        <div>
            <h1>Welcome to RoomMatch</h1>
        </div>
    );
};

function App() {
    return (
        <BrowserRouter>
            <Routes>

                <Route
                    path="/"
                    element={<Home />}
                />

                <Route
                    path="/login"
                    element={<Login />}
                />

                <Route
                    path="/register"
                    element={<Register />}
                />

                <Route
                    path="/profile"
                    element={<Profile />}
                />

                <Route
                    path="/preferences"
                    element={<Preferences />}
                />

            </Routes>
        </BrowserRouter>
    );
}

export default App;