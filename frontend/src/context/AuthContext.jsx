import { createContext, useContext, useState } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {

    const [user, setUser] = useState(() => {
        const savedUser = localStorage.getItem("roommatch_user");

        return savedUser
            ? JSON.parse(savedUser)
            : null;
    });

    const [token, setToken] = useState(() => {
        return localStorage.getItem("roommatch_token");
    });


    const login = (userData, jwtToken) => {

        setUser(userData);
        setToken(jwtToken);

        localStorage.setItem(
            "roommatch_user",
            JSON.stringify(userData)
        );

        localStorage.setItem(
            "roommatch_token",
            jwtToken
        );
    };


    const logout = () => {

        setUser(null);
        setToken(null);

        localStorage.removeItem("roommatch_user");
        localStorage.removeItem("roommatch_token");
    };


    return (
        <AuthContext.Provider
            value={{
                user,
                token,
                login,
                logout
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};


export const useAuth = () => {
    return useContext(AuthContext);
};