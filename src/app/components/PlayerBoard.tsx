"use client"
import React, { useEffect, useState } from "react";
import {
  useWaku,
  useContentPair,
  useLightPush,
  useStoreMessages,
  useFilterMessages,
} from '@waku/react';

import protobuf from 'protobufjs';
import WakuService, { MESSAGE_RECEIVED } from "../WakuService";


type Ship = {
    id: number;
    size: number;
    orientation: string;
    placed: boolean
}
const BOARD_SIZE = 10;
const SHIPS: Ship[] = [
  { id: 1, size: 3, orientation: "horizontal", placed: false },
  { id: 2, size: 3, orientation: "horizontal", placed: false },
  { id: 3, size: 2, orientation: "horizontal", placed: false },
  { id: 4, size: 2, orientation: "vertical", placed: false },
  { id: 5, size: 2, orientation: "vertical", placed: false },
];

let pollingInterval: any;
let POLLING_TIME = 1000;
let READY_TO_PLAY_TOPIC = 'waku/battleship/ready'


const ChatMessage = new protobuf.Type('ChatMessage')
  .add(new protobuf.Field('timestamp', 1, 'uint64'))
  .add(new protobuf.Field('sender', 2, 'string'))
  .add(new protobuf.Field('message', 3, 'string'));

const createBoard = () =>
  Array.from({ length: BOARD_SIZE }, () => Array(BOARD_SIZE).fill(0)); // Fill with 0 for empty cells

function PlayerBoard(props: {roomId: number}) {

  function decodeMessage(wakuMessage: any) {
    if (!wakuMessage.payload) return;

    const { timestamp, sender, message } = ChatMessage.decode(wakuMessage.payload);

    if (!timestamp || !sender || !message) return;

    const time = new Date();
    time.setTime(Number(timestamp));

    return {
      message,
      timestamp: time,
      sender,
      timestampInt: wakuMessage.timestamp,
    };
  }

  const roomId: number = props.roomId;

  // waku dependencies
  const { node } = useWaku();
  console.log({node})
  const { decoder, encoder } = useContentPair();

  const { messages: storeMessages } = useStoreMessages({
    node,
    decoder,
  });
  const { messages: filterMessages } = useFilterMessages({ node, decoder });

  useEffect(() => {

    console.log({storeMessages}, storeMessages.map(decodeMessage));
    console.log({filterMessages}, filterMessages.map(decodeMessage))

  }, [storeMessages, filterMessages])

  

  const { push } = useLightPush({ node, encoder });

  // end waku dependencies
  const [nodeStart, setNodeStart] = useState(false);

  async function sendMessage(sender: any, message: any) {
    const protoMessage = ChatMessage.create({
      timestamp: Date.now(),
      sender,
      message,
    });

    const serialisedMessage = ChatMessage.encode(protoMessage).finish();

    const timestamp = new Date();
    await push({
      payload: serialisedMessage,
      timestamp: timestamp,
    });

    console.log('MESSAGE PUSHED');
  }

  const [board, setBoard] = useState(createBoard());
  const [selectedShip, setSelectedShip] = useState<Ship | null>(null);
  const [ships, setShips] = useState<Ship[]>(SHIPS);
  const [username, setUsername] = useState<string>('');
  const [wakuInstance, setWakuInstance] = useState<WakuService>();

  if (wakuInstance) {
    wakuInstance.on(MESSAGE_RECEIVED, event => {
      console.log('message: ', event);
    })
  }

  const fetchPlayers = async () => {
    const _wakuInstance = new WakuService(READY_TO_PLAY_TOPIC);
    await _wakuInstance.init();
    await _wakuInstance.startWatchingForNewMessages();
    setWakuInstance(_wakuInstance); 
  }

  const sendReadyMessage = () => {
    sendMessage(username, 'waku hook test 1');
    // wakuInstance?.pushMessage(username, 'ready');
  }

  console.log('wakuInstance?.node: ', wakuInstance?.node)
  useEffect(() => {
    // fetchPlayers();
  }, []);

  const stopPollingForPlayers = () => {

  }

  const handleReset = () => {

    stopPollingForPlayers();
    setShips(SHIPS);
    setSelectedShip(null);
    setBoard(createBoard());
  };

  const handleShipSelection = (ship: Ship) => {
    if (!ship.placed) {
      setSelectedShip(ship);
    }
  };

  const areAllShipsPlaced = () => {
      // get a count of all placed ships
      const placedShips = ships.filter((_ship: Ship) => _ship.placed);

      return placedShips.length === SHIPS.length;
  }

  const resetShipPlacement = (shipId: number) => {
    const newBoard = createBoard();
    // Reset the board without the reset ship
    ships.forEach((ship) => {
      if (ship.id !== shipId && ship.placed) {
        // Re-place each ship except the reset one
        // Similar logic as placeShipOnBoard but without user interaction
      }
    });
    setBoard(newBoard);
    // Mark the reset ship as not placed
    setShips(
      ships.map((ship) =>
        ship.id === shipId ? { ...ship, placed: false } : ship
      )
    );
  };

  const placeShipOnBoard = (rowIndex: number, colIndex: number) => {
    if (!selectedShip) return;

    const newBoard = [...board];
    let canPlace = true;

    // Check if the ship can be placed
    for (let i = 0; i < selectedShip.size; i++) {
      if (selectedShip.orientation === "horizontal") {
        if (
          colIndex + i >= BOARD_SIZE ||
          newBoard[rowIndex][colIndex + i] !== 0
        ) {
          canPlace = false;
          break;
        }
      } else {
        if (
          rowIndex + i >= BOARD_SIZE ||
          newBoard[rowIndex + i][colIndex] !== 0
        ) {
          canPlace = false;
          break;
        }
      }
    }

    if (canPlace) {
      for (let i = 0; i < selectedShip.size; i++) {
        if (selectedShip.orientation === "horizontal") {
          newBoard[rowIndex][colIndex + i] = 1; // Mark ship cells with 1
        } else {
          newBoard[rowIndex + i][colIndex] = 1;
        }
      }
      setBoard(newBoard);

      // Mark the ship as placed
      const newShips = ships.map((ship) =>
        ship.id === selectedShip.id ? { ...ship, placed: true } : ship
      );
      setShips(newShips);
      setSelectedShip(null); // Clear selection
    }
  };

  console.log(board);
  return (
    <div>
      <div>
        <input type="text" value={username} onChange={e => setUsername(e.target.value)} />
      </div>
      <button onClick={handleReset}>reset</button>
      <div className="ship-selection">
        {ships
          .filter((ship) => !ship.placed)
          .map((ship) => (
            <button key={ship.id} onClick={() => handleShipSelection(ship)}>
              Ship {ship.id} (Size: {ship.size}, {ship.orientation})
            </button>
          ))}
      </div>
      <div className="board">
        {board.map((row, rowIndex) => (
          <div key={rowIndex} className="row">
            {row.map((cell, colIndex) => (
              <div
                key={colIndex}
                className={`cell ${cell === 1 ? "ship" : ""}`} // Use 'ship' class for cells with a ship
                onClick={() => {
                  if (cell === 1) resetShipPlacement(rowIndex);
                  else placeShipOnBoard(rowIndex, colIndex);
                }}
              ></div>
            ))}
          </div>
        ))}
      </div>
      <button onClick={sendReadyMessage}>Ready to play</button>
      {
          wakuInstance?.node && <button onClick={sendReadyMessage}>Ready to play</button>
      }
    </div>
  );
}

export default PlayerBoard;

// TODO:
// 1. create link to join room
// 2. generate random username
// 3. when someone joins a room - what happens?
