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
import { Message, Player } from "../types";
import { removeDuplicatesByKey } from "../utils";
import { BOARD_SIZE, createBoard, Ship } from "../utils/gameUtils";

const SHIPS: Ship[] = [
  { id: 1, size: 3, orientation: "horizontal", placed: false },
  { id: 2, size: 3, orientation: "horizontal", placed: false },
  { id: 3, size: 2, orientation: "horizontal", placed: false },
  { id: 4, size: 2, orientation: "vertical", placed: false },
  { id: 5, size: 2, orientation: "vertical", placed: false },
];


const ChatMessage = new protobuf.Type('ChatMessage')
  .add(new protobuf.Field('timestamp', 1, 'uint64'))
  .add(new protobuf.Field('sender', 2, 'string'))
  .add(new protobuf.Field('message', 3, 'string'))
  .add(new protobuf.Field('id', 4, 'string'));


function PlayerBoard(props: {roomId: number, messages: Message[], setMessages: any, player: Player}) {


  // waku dependencies
  const { node, isLoading, error } = useWaku();
  
  const { decoder, encoder } = useContentPair();

  
  const { messages: filterMessages } = useFilterMessages({ node, decoder });
  const {messages: storeMessages} = useStoreMessages({node, decoder});
  // end waku dependencies


  useEffect(() => {

    if (props.player === Player.p2 && !isLoading) {
      // send a message indicating that the second player has joined
      // first player created the room, so they can be assumed joined

      sendMessage(props.player, 'joined');
    }

  }, [props.player, isLoading])

  function decodeMessage(wakuMessage: any) {
    if (!wakuMessage.payload) return;

    const { timestamp, sender, message, id } = ChatMessage.decode(wakuMessage.payload);

    if (!timestamp || !sender || !message) {
      console.error({timestamp, sender, message, id}, 'missing props');
      
    };

    const time = new Date();
    time.setTime(Number(timestamp));

    return {
      message,
      timestamp: time,
      sender,
      timestampInt: wakuMessage.timestamp,
      id
    };
  }

  
  useEffect(() => {

    console.log({filterMessages, storeMessages})
    const filteredMessagesDecoded = filterMessages.map(decodeMessage);

    const updatedMessages = [...props.messages, ...filteredMessagesDecoded] as Message[];
    
    const filteredUpdatedMessages = removeDuplicatesByKey(updatedMessages, 'id');
    console.log({filteredUpdatedMessages, updatedMessages});
    props.setMessages(filteredUpdatedMessages);

  }, [filterMessages, storeMessages])

  

  const { push } = useLightPush({ node, encoder });

  async function sendMessage(sender: any, message: any) {

    const protoMessage = ChatMessage.create({
      timestamp: Date.now(),
      sender,
      message,
      id: crypto.randomUUID()
    });

    const serialisedMessage = ChatMessage.encode(protoMessage).finish();

    const timestamp = new Date();

    if (push) {
      const res = await push({
        payload: serialisedMessage,
        timestamp: timestamp,
      });
  
      console.log('MESSAGE PUSHED', res);
      if (res?.errors?.length && res?.errors?.length > 0) {
        alert('unable to connect to a stable node. please reload')

      }
    }
    
  }

  const [board, setBoard] = useState(createBoard());
  const [selectedShip, setSelectedShip] = useState<Ship | null>(null);
  const [ships, setShips] = useState<Ship[]>(SHIPS);

  
  
  const sendReadyMessage = () => {
    sendMessage(props.player, 'ready');
  }

  const handleReset = () => {

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

  if(isLoading) {
    return <div>loading...</div>
  }

  if (error) {
    return <div>error</div>
  }
  return (
    <div>
      
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
      <button disabled={!areAllShipsPlaced()} onClick={sendReadyMessage}>Ready to play</button>
      
    </div>
  );
}

export default PlayerBoard;

// TODO:
// 1. create link to join room
// 2. generate random username
// 3. when someone joins a room - what happens?
