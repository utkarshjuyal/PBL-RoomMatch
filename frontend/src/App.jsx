import { useEffect, useState } from "react";
import api from "./services/api";

function App() {
    const [message, setMessage] = useState("");

    useEffect(() => {
        const testBackend = async () => {
            try {
                const response = await api.get("/");
                setMessage(response.data.message);
            } catch (error) {
                console.error("Backend connection failed:", error);
                setMessage("Backend connection failed");
            }
        };

        testBackend();
    }, []);

    return (
        <div>
            <h1>RoomMatch</h1>
            <p>{message}</p>
        </div>
    );
}

export default App;