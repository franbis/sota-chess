import type { FunctionTool } from 'openai/resources/responses/responses.mjs';



// Assume other AIs follow the same 'ChatML' standard extension.
type _FunctionTool = FunctionTool;


interface FunctionCallData {
    name: string
    arguments: Record<string, any>
}



export {
    type _FunctionTool as FunctionTool,
    type FunctionCallData
}