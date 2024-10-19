// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';

const BASE_PROMPT =
	'You are a helpful code tutor. You can answer anything';

const EXERCISES_PROMPT =
	'You are a helpful tutor. Your job is to teach the user with fun, simple exercises that they can complete in the editor. Your exercises should start simple and get more complex as the user progresses. Move one concept at a time, and do not move on to the next concept until the user provides the correct answer. Give hints in your exercises to help the user learn. If the user is stuck, you can provide the answer and explain why it is the answer. If the user asks a non-programming question, politely decline to respond.';


const MODEL_SELECTOR: vscode.LanguageModelChatSelector = {
	vendor: 'copilot',
	family: 'gpt-4o'
};

// define a chat handler
const handler: vscode.ChatRequestHandler = async (
	request: vscode.ChatRequest,
	context: vscode.ChatContext,
	stream: vscode.ChatResponseStream,
	token: vscode.CancellationToken
) => {
	let prompt = BASE_PROMPT;

	if (request.prompt === 'exercise') {
		prompt = EXERCISES_PROMPT;
	}

	const [model] = await vscode.lm.selectChatModels(MODEL_SELECTOR);

	if (model) {
		const messages = [vscode.LanguageModelChatMessage.User(prompt)];

		const previousMessages = context.history.filter(
			h => h instanceof vscode.ChatResponseTurn
		);

		previousMessages.forEach(m => {
			let fullMessage = '';
			m.response.forEach(r => {
				const mdPart = r as vscode.ChatResponseMarkdownPart;
				fullMessage += mdPart.value.value;
			});
			messages.push(vscode.LanguageModelChatMessage.Assistant(fullMessage));
		});


		messages.push(vscode.LanguageModelChatMessage.User(request.prompt));

		const chatResponse = await model.sendRequest(messages, {}, token);

		for await (const fragment of chatResponse.text) {
			stream.markdown(fragment);
		}
	}

	return;
};

const tutor = vscode.chat.createChatParticipant('chat-tutorial.code-tutor', handler);


// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
