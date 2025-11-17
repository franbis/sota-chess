import { useEffect, useRef, useState } from 'react';

import type { Square } from 'chess.js';
import { Chessboard, type PieceDropHandlerArgs, type PieceHandlerArgs } from 'react-chessboard';

import type { ChessboardSquareData, CastlingSide } from './script/data/chess_data';
import { LooseChessManager, type ForceMoveArgs, type MoveArgs } from './script/chess/chess_managers';
import { OpenAIChessPlayer } from './script/ai/openai_ai';

import './style/App.sass';



function App() {
	const [gameFEN, setGameFEN] = useState('');
	// TODO - Rooks tracking for castling.
	const [AICastlingRooks, setAICastlingRooks] = useState<Record<CastlingSide, Square> | null>(null);

	const gameManRef = useRef(new LooseChessManager());

	const aiRef = useRef(new OpenAIChessPlayer({
		apiKey: 'TODO',
		TTSModel: 'TODO',
		funcCallModel: 'TODO',
		color: 'b'
	}));


	const getGameMan = ()=>{
		return gameManRef.current
	};


	const getGame = ()=>{
		return getGameMan().game;
	};


	const updateFEN = ()=>{
		setGameFEN(getGame().fen());
	};


	const canDragPiece = ({ isSparePiece, piece, square }: PieceHandlerArgs)=>{
		// Allow only the user's pieces to be dragged.
		return piece.pieceType[0] !== aiRef.current.color;
	};


	const onPieceDrop = ({ piece, sourceSquare, targetSquare }: PieceDropHandlerArgs)=>{
		// Attempt to execute the user's move.
		const moved = getGameMan().move({ sourceSquare, targetSquare} as MoveArgs);

		if (moved) {
			updateFEN();

			// The user moved. It's the AI's turn, request a move.
			(async ()=>{
				const data = await aiRef.current.requestMove(getGame().board() as ChessboardSquareData[][]);
				if (data.name == "move") {
					// The piece name may not be a valid piece symbol, interpret it.
					data.arguments.pieceType = aiRef.current.pieceNameToSymbol(data.arguments.pieceType);
					getGameMan().forceMove(data.arguments as ForceMoveArgs);
				}
				updateFEN();
			})();
		}

		return moved;
	};


	useEffect(()=>{
		// Initialize the game state and board.
		gameManRef.current = new LooseChessManager();
		updateFEN();
	}, []);


	return (
		<div id="chessboard_cont">
				<Chessboard
					options={{
						position: gameFEN,
						canDragPiece,
						onPieceDrop
					}}
				/>
		</div>
	);
}

export default App;