import { useEffect, useState } from 'react';

import type { Color } from 'chess.js';
import { Chessboard, type PieceDropHandlerArgs, type PieceHandlerArgs } from 'react-chessboard';

import type { GameStateMsgContent } from '../../shared/types/chess.types';

import { RemoteChessManager, type MoveArgs } from './script/chess/chess_managers';

import './style/App.sass';



function App() {
	const [gameMan, setGameMan] = useState<RemoteChessManager | null>(null);
	const [color, setColor] = useState<Color>('w');
	const [gameState, setGameState] = useState<GameStateMsgContent | null>()


	const canDragPiece = ({ isSparePiece, piece, square }: PieceHandlerArgs)=>{
		// Allow only the user's pieces to be dragged.
		return piece.pieceType[0] === color;
	};


	const onPieceDrop = ({ piece, sourceSquare, targetSquare }: PieceDropHandlerArgs)=>{
		// Inform the server of the move attempt.
		gameMan?.move({ sourceSquare, targetSquare} as MoveArgs);

		// Simulate the move until the server validates it.
		return true;
	};


	useEffect(()=>{
		setGameMan(() => new RemoteChessManager({
			onConnect(instance) { instance.createGame({ color }); },
			onStateChange: setGameState
		}));
	}, []);


	return (
		<div id="chessboard_cont">
				<Chessboard
					options={{
						// Default to an empty board.
						position: gameState?.fen ?? '',
						canDragPiece,
						onPieceDrop
					}}
				/>
		</div>
	);
}

export default App;