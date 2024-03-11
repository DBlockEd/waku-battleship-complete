"use client"
import React, { useEffect, useState } from "react";
import {
  useWaku,
  useContentPair,
  useLightPush,
  useStoreMessages,
  useFilterMessages,
} from '@waku/react';

import { Message, Player } from "../types";
import { decodeMessage, findLatestMessage, removeDuplicatesByKey } from "../utils";
import { BOARD_SIZE, ChatMessage, createBoard, MoveMessage, MoveReplyMessage, Ship, SHIPS } from "../utils/gameUtils";
import Spinner from "./Spinner";

function PlayerBoard(props: { 
  filterMessages: any,
  messages: Message[], 
  setMessages: any, 
  player: Player,
  node: any,
  isLoading: boolean,
  error: any,
  encoder: any,
  decoder: any
}) {


  // waku dependencies
  const { node, isLoading, error } = props;
  
  const { decoder, encoder } = props;
  
  const { filterMessages } = props;
  
  // end waku dependencies


  useEffect(() => {

    if (!isLoading) {
      // send a message indicating that the second player has joined
      // first player created the room, so they can be assumed joined

      sendMessage(props.player, 'joined');
      
    }

  }, [props.player, isLoading])

  const doesShipExistOn = (row: number, col: number, board: number[][]) => {
    return Boolean(board[row][col]);
  }

  const respondToMove = async (move:string) => {
    const rowIndex = parseInt(move.split(',')[0]);
    const colIndex = parseInt(move.split(',')[1]);

    await sendHitMessage(doesShipExistOn(rowIndex, colIndex, board), `${rowIndex},${colIndex}`);

    if (doesShipExistOn(rowIndex, colIndex, board)) {
        console.log(" opponent hit a ship")
        let newBoard = [...board];
        newBoard[rowIndex][colIndex] = 'X';
        setBoard(newBoard);
        return;
    }

    console.log("opponent missed")
  

  }

  

  const handleLatestMessage = (message: Message) => {
    console.log('latest message: ', message);
    // do nothing if the message is sent by self
    if (message.sender === props.player) {
      console.log('not responding to latest message');
      return;
    };

    console.log('responding to latest message')
    if (message.move) {
      respondToMove(message.move);
      return;
    }
    
  }

  useEffect(() => {
    
    const filteredMessagesDecoded = filterMessages.map(decodeMessage);

    const updatedMessages = [...props.messages, ...filteredMessagesDecoded] as Message[];
    
    const filteredUpdatedMessages = removeDuplicatesByKey(updatedMessages, 'id');
    props.setMessages(filteredUpdatedMessages);

    const latestMessage = findLatestMessage(filteredMessagesDecoded as Message[]);
    console.log({latestMessage})
    if (latestMessage) {
      filteredMessagesDecoded && handleLatestMessage(latestMessage);
    }
    

  }, [filterMessages])

  

  const { push } = useLightPush({ node, encoder });

 const sendHitMessage = async (hit: boolean, move: string) => {
   console.log('sending hit message: ', hit);
  const protoMessage = MoveReplyMessage.create({
      timestamp: Date.now(),
      sender: props.player,
      hit: hit? 1: 0,
      move,
      id: crypto.randomUUID()
  })

  const serialisedMessage = MoveReplyMessage.encode(protoMessage).finish();

  const timestamp = new Date();

  if (push) {
    const res = await push({
      payload: serialisedMessage,
      timestamp
    })

    if (res?.errors?.length && res?.errors?.length > 0) {
      alert('unable to connect to a stable node. please reload')

    }
  }
 }

  async function sendMessage(sender: any, message: any) {

    console.info('sending message: ', `${sender}: ${message}`);
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
    return <Spinner />
  }

  if (error) {
    return <div>error</div>
  }
  return (
    <div className="grid grid-cols-2 gap-4">
      
      
      <div className="flex flex-col items-center space-y-2 mt-4">

        {ships
          .filter((ship) => !ship.placed)
          .map((ship) => (
            <button 
              key={ship.id} 
              onClick={() => handleShipSelection(ship)}
              className="px-4 py-2 bg-blue-500 text-white font-bold rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
              >
              Ship {ship.id} (Size: {ship.size}, {ship.orientation})
            </button>
          ))}
      </div>
      <div className="flex flex-col items-center space-y-2 mt-4">
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
              >
                {
                  cell === 'X' && 'X'
                }
              </div>
            ))}
          </div>
        ))}


      <div className="flex justify-between items-center w-full py-4">

<button 
  onClick={handleReset}
  className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white font-bold rounded focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50"

  >
    
  reset
  </button>
<button 
  
  onClick={sendReadyMessage}
  className={`px-6 py-2 font-bold text-lg rounded transition-colors duration-150 ${
    areAllShipsPlaced() ? 'bg-green-500 text-white hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50' : 'bg-gray-500 text-gray-200 cursor-not-allowed'}`}
>
  Ready to play
  </button>
</div>
      </div>
      </div>

      
    </div>
  );
}

export default PlayerBoard;

// TODO:
// 1. create link to join room
// 2. generate random username
// 3. when someone joins a room - what happens?
