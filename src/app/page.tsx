import PlayerBoard from "./components/PlayerBoard";

export default function Home() {
  return (
    <>
      <h2>Battleship Game</h2>
      <div className="container">  
        <div className="left-section">
          <div className="player-board">
            <PlayerBoard />
          </div>
          <div className="opponent-board marker-class">
            opponent board goes here
          </div>
        </div>
        <div className="right-section marker-class">
          Right section
        </div>
      </div>
    </>
  );
}
