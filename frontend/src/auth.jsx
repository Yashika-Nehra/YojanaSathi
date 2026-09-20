import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { getMe, loginUser, logoutUser, signupUser, updateMyProfile } from "./api";

const TOKEN_KEY = "ys_auth_token";
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    let active = true;
    if (!localStorage.getItem(TOKEN_KEY)) { setLoading(false); return () => { active = false; }; }
    getMe().then((data) => { if (active) setUser(data.user); }).catch(() => { localStorage.removeItem(TOKEN_KEY); if (active) setUser(null); }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);
  const value = useMemo(() => ({
    user, loading, isAuthenticated: Boolean(user),
    async login(email,password){const data=await loginUser(email,password);localStorage.setItem(TOKEN_KEY,data.token);setUser(data.user);return data.user;},
    async signup(name,email,password){const data=await signupUser(name,email,password);localStorage.setItem(TOKEN_KEY,data.token);setUser(data.user);return data.user;},
    async logout(){try{await logoutUser();}catch{} localStorage.removeItem(TOKEN_KEY);setUser(null);},
    async saveProfile(profile){const data=await updateMyProfile(profile);setUser(data.user);return data.user;},
  }),[user,loading]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
export function useAuth(){const value=useContext(AuthContext);if(!value) throw new Error("useAuth must be used inside AuthProvider");return value;}
