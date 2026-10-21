
import { useState } from "react";
import MainMenu from "./components/MainMenu";

export default function App() {
  const [screen, setScreen] = useState("home");

  switch (screen) {
    case "login":
      return (<h1>Tutaj będzie formularz logowania</h1>);

    case "register":
      return (<h1>Tutaj będzie formularz logowania</h1>);

    case "game":
      return (
        <GameMenu
          onNewGame={() => setScreen("new-game")}
          onContinue={() => setScreen("continue")}
        />
      );

    case "home":
    default:
      return (
        <MainMenu
          onLogin={() => setScreen("login")}
          onRegister={() => setScreen("register")}
        />
      );
  }
}

