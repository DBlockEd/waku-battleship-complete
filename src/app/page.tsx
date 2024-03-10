"use client"
import { useEffect } from "react";
import PlayerBoard from "./components/PlayerBoard";
import { ContentPairProvider, useContentPair, useLightPush, useWaku, useFilterMessages, useStoreMessages } from "@waku/react";
import { LightNode } from '@waku/sdk'
import protobuf from 'protobufjs';
// import { useStoreMessages } from "../../node_modules/@waku/react/dist/useStoreMessages";



export default function Home() {
  const { isLoading, error, node } = useWaku<LightNode>();
  const { encoder, decoder } = useContentPair()
  const { push } = useLightPush({ node, encoder });

  const {messages} = useStoreMessages({ node, decoder });


  console.log({messages})
  
  useEffect(() => {
    console.log({ isLoading, error, node })
  },[isLoading, error, node])
  
  const roomId = Math.random();
  if (isLoading) {
    return "loading waku..."
  }

  async function pushMessage() {
    if (!node || !push) return;
    const timestamp = new Date();
    const ChatMessage = new protobuf.Type("ChatMessage")
      .add(new protobuf.Field("timestamp", 1, "uint64"))
      .add(new protobuf.Field("message", 2, "string"));
    const protoMessage = ChatMessage.create({
        timestamp: timestamp,
        message: "Hello World!"
    });

    // Serialise the message and push to the network
    const payload = ChatMessage.encode(protoMessage).finish();
    // const res = await push({ payload, timestamp })
    console.log("push successful", res);
    
  }

  

  return (
    <>
     <h2>Battleship Game</h2>
      <div className="container">  
        <div className="left-section">
          <div className="player-board">
            <PlayerBoard roomId={roomId} />
          </div>
          <div className="opponent-board marker-class">
            opponent board goes here
          </div>
          <button onClick={pushMessage}>
            Push Message
          </button>
        </div>
        <div className="right-section marker-class">
          Right section
        </div>
      </div>
    </>
  );
}
