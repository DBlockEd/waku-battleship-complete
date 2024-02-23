"use client"
import React, { useState } from "react";

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

const createBoard = () =>
  Array.from({ length: BOARD_SIZE }, () => Array(BOARD_SIZE).fill(0)); // Fill with 0 for empty cells

function PlayerBoard() {
  const [board, setBoard] = useState(createBoard());
  const [selectedShip, setSelectedShip] = useState<Ship | null>(null);
  const [ships, setShips] = useState<Ship[]>(SHIPS);

  const startPollingForPlayers = () => {
    // 1. generate a uuid for player
    // 2. start messaging on the battleship-rtp-topic your uuid
  }

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
      {
          areAllShipsPlaced() && <button onClick={startPollingForPlayers}>Ready to play</button>
      }
    </div>
  );
}

export default PlayerBoard;
