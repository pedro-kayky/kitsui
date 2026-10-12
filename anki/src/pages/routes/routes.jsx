import { useState, useEffect } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Home from "../home/home";
import Review from "../review/Review";
import Progress from "../progress/Progress";
import Decks from "../deck/decks";
import Settings from "../../assets/components/Settings/Settings";
import NavBar from "../../assets/components/Navbar/NavBar";

const AppRoutes = () => {
  // Estado global do Utilizador (lê do localStorage se já tiver sessão iniciada)
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("linguaDeck_user");
    return savedUser ? JSON.parse(savedUser) : null;
  });

  // Função para efetuar Login / Registo
  const handleLogin = (credentials) => {
    // Exemplo de estrutura do utilizador (futuramente conectado à tua API/Backend)
    const userData = {
      name: credentials.name || "Student",
      email: credentials.email,
      isPremium: false
    };
    setUser(userData);
    localStorage.setItem("linguaDeck_user", JSON.stringify(userData));
  };

  // Função para Terminar Sessão (Logout)
  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem("linguaDeck_user");
  };

  return (
    <BrowserRouter>
      {/* Passa as props do utilizador para a NavBar abrir o menu corretamente */}
      <NavBar user={user} onLogout={handleLogout} />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/decks" element={<Decks />} />
        <Route path="/review" element={<Review />} />
        <Route path="/progress" element={<Progress />} />
        
        {/* 2. Adiciona a rota de Settings aqui */}
        <Route 
          path="/settings" 
          element={<Settings user={user} onLogin={handleLogin} onLogout={handleLogout} />} 
        />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;