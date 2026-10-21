
import MainMenu from "./components/MainMenu";
import { Routes, Route } from "react-router";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<MainMenu />} />
      <Route path="*" element={<div>Nie znaleziono strony</div>} />
    </Routes>
  );
}

