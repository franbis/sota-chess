import Fastify, { type FastifyInstance } from 'fastify';

import type { GameState, Game, ReqGameStateReqArgs, CreateGameReqArgs, MoveReqArgs } from '../../shared/chess/chess_data';



const server: FastifyInstance = Fastify({ logger: true });


server.post<{
	Params: CreateGameReqArgs,
	Reply: Game
}>('/game/create', async (request, reply) => {
	return {
		id: `TODO ${request.params.color}`,
		state: {
			fen: 'test',
			check: 'w',
			checkmate: false
		}
	};
});


server.get<{
	Params: ReqGameStateReqArgs,
	Reply: GameState
}>('/game/state/:id', async (request, reply) => {
	const params = request.params;

	return {
		fen: `TEST ${params.id}`,
		check: 'w',
		checkmate: false
	};
});


server.post<{
	Params: MoveReqArgs,
	Reply: GameState
}>('/game/move', async (request, reply) => {
	
	// if (moved) {
	// 	updateFEN();

	// 	// The user moved. It's the AI's turn, request a move.
	// 	(async ()=>{
	// 		const data = await aiRef.current.requestMove(getGame().board() as ChessboardSquareData[][]);
	// 		if (data.name == "move") {
	// 			// The piece name may not be a valid piece symbol, interpret it.
	// 			data.arguments.pieceType = aiRef.current.pieceNameToSymbol(data.arguments.pieceType);
	// 			getGameMan().forceMove(data.arguments as ForceMoveArgs);
	// 		}
	// 		updateFEN();
	// 	})();
	// }

	return {
		fen: `TODO ${request.params.sourceSquare} ${request.params.targetSquare}`,
		check: 'w',
		checkmate: false
	};
});


const start = async () => {
	try {
		await server.listen({ port: 3000 });
	} catch (err) {
		server.log.error(err);
		process.exit(1);
	}
};

start();
