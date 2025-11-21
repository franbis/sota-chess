import path from 'path';
import { fileURLToPath } from 'url';

import Fastify from 'fastify';
import fastifyWebsocket, { type WebSocket as WebSocketWrapper } from '@fastify/websocket';
import fastifyStatic from '@fastify/static';

import type { ChessboardSquareData, Message, Move } from '../../shared/types/chess.types';
import { MessageType } from '../../shared/data/chess.data';

import { LooseChessManager, type ForceMoveArgs, type MoveArgs } from './chess/chess_managers';
import { OpenAIChessPlayer } from './ai/openai_ai';
import type { AIMoveArgs } from './ai/ai';

import { arrBuffToB64 } from '../../shared/script/utils/b64_utils';



const app = Fastify({ logger: true });

app.register(fastifyWebsocket);
app.register(fastifyStatic, {
  root: path.join(__dirname, 'public'),
  index: 'index.html'
});


let gameMan: LooseChessManager;
let ai: OpenAIChessPlayer;

let lastMove: Move | undefined;


function sendGameState(connection: WebSocketWrapper, isCheck?: boolean, isCheckmate?: boolean) {
	const msg: Message = {
		type: MessageType.STATE,
		content: {
			fen: gameMan.game.fen(),
			lastMove,
			isCheck: isCheck ?? gameMan.game.isCheck(),
			isCheckmate: isCheckmate ?? gameMan.game.isCheckmate()
		}
	};
	connection.send(JSON.stringify(msg));
}


function sendExplanationVM(
	connection: WebSocketWrapper,
	explanation: string,
	audioBuffer: ArrayBuffer
) {
	const msg: Message = {
		type: MessageType.EXPLANATION,
		content: {
			explanation,
			audioBufferB64: arrBuffToB64(audioBuffer)
		}
	};
	connection.send(JSON.stringify(msg));
}


app.register(async function (fastify) {
	fastify.get('/ws', { websocket: true }, (conn, req) => {
		conn.on('message', (rawData) => {
			const msg: Message = JSON.parse(String(rawData));

			if (msg.type === MessageType.CREATE) {
				gameMan = new LooseChessManager();
				sendGameState(conn);
				ai = new OpenAIChessPlayer({
					// TODO - Use externally defined settings.
					apiKey: 'TODO',
					TTSModel: 'TODO',
					funcCallModel: 'TODO',
					color: 'b'
				});
			}

			if (msg.type === MessageType.MOVE) {
				const moved = gameMan.move(msg.content);
				lastMove = msg.content;

				if (moved) {
					sendGameState(conn);

					// It's the AI's turn now, request a move.
					(async ()=>{
						const data = await ai.requestMove(gameMan.game.board() as ChessboardSquareData[][]);
						// Assume the arguments contain all the keys from 'AIMove'.
						const {
							explanation, isCheck, isCheckmate,
							...otherArgs
						} = data.arguments as AIMoveArgs;

						if (data.name == 'move') {
							// The piece name may not be a valid piece symbol, interpret it.
							otherArgs.pieceType = ai.pieceNameToSymbol(data.arguments.pieceType);
							gameMan.forceMove(otherArgs as ForceMoveArgs);
							lastMove = otherArgs as Pick<ForceMoveArgs, keyof Move>;
							sendGameState(conn, isCheck, isCheckmate);
							
							sendExplanationVM(
								conn,
								explanation,
								await ai.genMoveExplanationVM(explanation)
							)
						}
					})();
				}
			}

		});
	});
});


const start = async () => {
	try {
		await app.ready();
		await app.listen({ port: 3000 });
	} catch (err) {
		app.log.error(err);
		process.exit(1);
	}
};

start();