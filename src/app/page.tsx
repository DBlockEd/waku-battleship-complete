"use client"
import PlayerBoard from "./components/PlayerBoard";
import { ContentPairProvider, useWaku } from "@waku/react";


export default function Home() {
  const { isLoading, error, node } = useWaku();
  console.log({ isLoading, error, node })
  
  const roomId = Math.random();
  if (isLoading) {
    return "loading waku..."
  }

  return (
      <ContentPairProvider contentTopic={"/my-app/2/chatroom-1/proto"}>
      <h2>Battleship Game</h2>
      <div className="container">  
        <div className="left-section">
          <div className="player-board">
            <PlayerBoard roomId={roomId} />
          </div>
          <div className="opponent-board marker-class">
            opponent board goes here
          </div>
        </div>
        <div className="right-section marker-class">
          Right section
        </div>
      </div>
    </ContentPairProvider>
  );
}
