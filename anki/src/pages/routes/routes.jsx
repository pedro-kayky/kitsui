import { useState, useEffect } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Home from "../home/home";
import Review from "../review/Review";
import Progress from "../progress/Progress";
import Decks from "../deck/decks";
import Settings from "../Settings/settings";
import NavBar from "../../assets/components/Navbar/NavBar";
import About from "../publicpage/about";
import Contact from "../publicpage/Contact";
import Terms from "../publicpage/Terms";
import Guides from "../publicpage/Guidex";
import { supabase } from '../../assets/components/supaBase/supaBaseClient'

const AppRoutes = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    // 1. Obtém a sessão inicial do Supabase
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user || null);
    });

    // 2. Escuta mudanças na autenticação (login, logout, refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  return (
    <BrowserRouter>
      {/* Passa o utilizador global para a NavBar */}
      <NavBar user={user} onLogout={handleLogout} />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/decks" element={<Decks />} />
        <Route path="/review" element={<Review />} />
        <Route path="/progress" element={<Progress />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/Terms" element={<Terms />} />
        <Route path="/guides" element={<Guides />} />
        <Route path="/guides/:slug" element={<Guides />} />
        
        {/* Rota de Settings/Profile a receber o mesmo utilizador */}
        <Route 
          path="/settings" 
          element={<Settings user={user} onLogout={handleLogout} />} 
        />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;