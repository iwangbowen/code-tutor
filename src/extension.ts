// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';

const BASE_PROMPT =
  'You are a helpful code tutor. You can answer anything';

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

	const [model] = await vscode.lm.selectChatModels(MODEL_SELECTOR);

	if (model) {
		const messages = [vscode.LanguageModelChatMessage.User(prompt)];

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
