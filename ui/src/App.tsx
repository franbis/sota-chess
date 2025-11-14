import { useEffect, useRef, useState } from 'react';

import type { Color, Square } from 'chess.js';
import { Chessboard, type PieceDropHandlerArgs, type PieceHandlerArgs } from 'react-chessboard';

// import type { GameState, Game } from '../../shared/chess/chess_data';
// import type { ChessboardSquareData, CastlingSide } from './script/data/chess_data';
import { RemoteChessManager, type MoveArgs } from './script/chess/chess_managers';

import './style/App.sass';



function App() {
	const [gameFEN, setGameFEN] = useState('');
	// TODO - Rooks tracking for castling.
	//const [AICastlingRooks, setAICastlingRooks] = useState<Record<CastlingSide, Square> | null>(null);

	const gameManRef = useRef(new RemoteChessManager());
	const [color, setColor] = useState<Color>('b');


	const getGameMan = ()=>{
		return gameManRef.current
	};


	const canDragPiece = ({ isSparePiece, piece, square }: PieceHandlerArgs)=>{
		// Allow only the user's pieces to be dragged.
		return piece.pieceType[0] === color;
	};


	const onPieceDrop = ({ piece, sourceSquare, targetSquare }: PieceDropHandlerArgs)=>{
		// Attempt to execute the user's move.
		// FIXME - Returns a Promise. Should use simulation & replication instead.
		getGameMan().move({ sourceSquare, targetSquare} as MoveArgs);

		//return moved;
		return true;
	};


	useEffect(()=>{
		(async ()=>{
			getGameMan().createGame({ color });
		})();
	}, []);


	return (
		<div id="chessboard_cont">
				<Chessboard
					options={{
						position: getGameMan()?.state?.fen,
						canDragPiece,
						onPieceDrop
					}}
				/>
		</div>
	);
}

export default App;