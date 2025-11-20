import { useEffect, useState } from 'react';

import type { Color } from 'chess.js';
import { Chessboard, type PieceDropHandlerArgs, type PieceHandlerArgs } from 'react-chessboard';

import type { GameState, GameStateMsgContent } from '../../shared/types/chess.types';

import { RemoteChessManager, type MoveArgs } from './script/chess/chess_managers';

import './style/App.sass';



function App() {
	const [gameMan, setGameMan] = useState<RemoteChessManager | null>(null);
	const [color, setColor] = useState<Color>('w');
	const [gameState, setGameState] = useState<GameState | null>(null);


	const canDragPiece = ({ isSparePiece, piece, square }: PieceHandlerArgs)=>{
		// Allow only the user's pieces to be dragged.
		return piece.pieceType[0] === color;
	};


	const onPieceDrop = ({ piece, sourceSquare, targetSquare }: PieceDropHandlerArgs)=>{
		if (!gameMan) return false;
		
		const moved = gameMan.move({ sourceSquare, targetSquare} as MoveArgs);
		return moved;
	};


	useEffect(()=>{
		setGameMan(() => new RemoteChessManager({
			onConnect(instance) { instance.createGame({ color }); },
			onStateChange: state => setGameState(state ?? null)
		}));
	}, []);


	let squareStyles = {};
	if (gameState?.lastMove) {
		squareStyles = Object.values(gameState?.lastMove ?? {}).reduce((acc, k) => {
			acc[k] = {
				backgroundColor: '#8cff1847'
			}
			return acc;
		}, {});
	}


	return (
		<div id="chessboard_cont">
				<Chessboard
					options={{
						// Default to an empty board.
						position: gameState?.fen ?? '',
						canDragPiece,
						onPieceDrop,
						squareStyles
					}}
				/>
		</div>
	);
}

export default App;