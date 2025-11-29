import { useEffect, useRef, useState } from 'react';

import type { Color, Square } from 'chess.js';
import { Chessboard, type PieceDropHandlerArgs, type PieceHandlerArgs } from 'react-chessboard';

import type { GameState, GameStateMsgContent } from '../../shared/types/chess.types';

import { RemoteChessManager, type MoveArgs } from './script/chess/chess_managers';

import './style/App.sass';



function App() {
	const [gameMan, setGameMan] = useState<RemoteChessManager | null>(null);
	const [color, setColor] = useState<Color>('w');
	const [gameState, setGameState] = useState<GameState | null>(null);
	const [availMoves, setAvailMoves] = useState<Square[]>([]);

	const boardContRef = useRef<HTMLDivElement | null>(null);


	/**
	 * Return the color of the king who's in check according to
	 * the game logic or to the AI if there's no logical check.
	 */
	const getLooseCheckColor = () => {
		return gameMan?.checkedColor ?? (gameState?.isCheck ? color : null);
	}


	const canDragPiece = ({ isSparePiece, piece, square }: PieceHandlerArgs)=>{
		// Allow only the user's pieces to be dragged.
		return piece.pieceType[0] === color;
	};


	const onPieceDrag = ({ isSparePiece, piece, square }: PieceHandlerArgs) => {
		const moves = gameMan?.getAvailMoves(square as Square) ?? [];
		setAvailMoves(moves);
	};


	const onPieceDrop = ({ piece, sourceSquare, targetSquare }: PieceDropHandlerArgs)=>{
		setAvailMoves([]);

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


	// Handle square elements on game state changes.
	useEffect(() => {
		if (boardContRef.current) {
				const squares = [
					...boardContRef.current.querySelectorAll('div[data-square]')
				] as HTMLDivElement[];
				const kings = [
					...boardContRef.current.querySelectorAll('div[data-piece$="K"]')
				] as HTMLDivElement[];

			// Style available move squares for the piece which is being dragged.
			for (const s of squares) {
				if (availMoves.includes(s.dataset.square as Square))
					s.classList.add('avail_move');
				else
					s.classList.remove('avail_move');
			}

			if (gameState?.lastMove) {
				// Toggle styling based on the last move squares.
				const lastMoveSquares: Square[] = Object.values(gameState?.lastMove ?? {});
				for (const s of squares) {
					if (lastMoveSquares.includes(s.dataset.square as Square))
						s.classList.add('last_move');
					else
						s.classList.remove('last_move');
				}
			}

			// Style any king who's in check.
			for (const k of kings) {
				if (getLooseCheckColor() === k.dataset.piece?.charAt(0))
					k.classList.add('checked');
				else
					k.classList.remove('checked');
			}
		}
	}, [boardContRef.current, gameState, availMoves]);


	return (
		<div id='chessboard_cont' ref={boardContRef}>
				<Chessboard
					options={{
						// Default to an empty board.
						position: gameState?.fen ?? '',
						canDragPiece,
						onPieceDrag,
						onPieceDrop
					}}
				/>
		</div>
	);
}

export default App;