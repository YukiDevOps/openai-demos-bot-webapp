"use strict";
// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EchoBot = void 0;
const botbuilder_1 = require("botbuilder");
const axios_1 = require("axios");
const global_1 = require("./global");
class EchoBot extends botbuilder_1.ActivityHandler {
    constructor() {
        super();
        // let prompt_old = `
        // As an advanced chatbot, your primary goal is to assist users to the best of your ability. This may involve answering questions, providing helpful information, or completing tasks based on user input. In order to effectively assist users, it is important to be detailed and thorough in your responses. Use examples and evidence to support your points and justify your recommendations or solutions.
        // <conversation history>
        // User: <user input>
        // Chatbot:
        // `
        // const url = "https://openaimma.openai.azure.com/openai/deployments/text-davinci-003/completions?api-version=2022-12-01"
        let systemim;
        if (typeof process.env.AOAI_SYSTEM !== 'undefined') {
            systemim = process.env.AOAI_SYSTEM;
        }
        else {
            systemim = "高度なチャットボットとしての主な目標は、ユーザーの能力を最大限に発揮できるようにすることです。これには、質問への回答、役立つ情報の提供、またはユーザー入力に基づくタスクの補完が含まれる場合があります。ユーザーを効果的に支援するためには、詳細かつ徹底した対応が重要です。例と証拠を使用して、ポイントを裏付け、正当な推奨事項や解決策を提示します。";
        }
        let prompt = `<|im_start|>system ${systemim}<|im_end|>

        <conversation history>

        <|im_start|>user <user input><|im_end|>

        <|im_start|>assistant`;
        let originurl;
        let model;
        let apikey;
        if (typeof process.env.AOAI_ENDPOINT !== 'undefined' && typeof process.env.AOAI_MODEL_NAME !== 'undefined' && typeof process.env.AOAI_API_KEY !== 'undefined') {
            originurl = process.env.AOAI_ENDPOINT;
            model = process.env.AOAI_MODEL_NAME;
            apikey = process.env.AOAI_API_KEY;
        }
        else {
            throw new Error(`Some of variables AOAI_ENDPOINT, AOAI_MODEL_NAME, AOAI_API_KEY is not defined.`);
        }
        const url = `${originurl}openai/deployments/${model}/completions?api-version=2022-12-01`;
        let conversation_history = "";
        const headers = {
            'Content-Type': 'application/json',
            // 'Authorization': 'Bearer YOUR_TOKEN'
            'api-key': apikey
        };
        function postDataToEndpoint(url, requestBody, headers) {
            return __awaiter(this, void 0, void 0, function* () {
                try {
                    const response = yield axios_1.default.post(url, requestBody, { headers });
                    return response.data;
                }
                catch (error) {
                    throw new Error(`Error posting data to ${url}: ${error}`);
                }
            });
        }
        // See https://aka.ms/about-bot-activity-message to learn more about the message and other activity types.
        this.onMessage((context, next) => __awaiter(this, void 0, void 0, function* () {
            // construct prompt
            let tmp_prompt = prompt.replace("<conversation history>", conversation_history).replace("<user input>", context.activity.text);
            // construct request body
            const aoaiParamVar = new global_1.aoaiParam();
            let aoaitoken = aoaiParamVar.getToken();
            let aoaitemp = aoaiParamVar.getTemp();
            const requestBody = {
                prompt: tmp_prompt,
                max_tokens: aoaitoken,
                temperature: aoaitemp
                // , presence_penalty: "0.0"
                // , frequency_penalty: "0.0"
            };
            // send request to openai
            const data = yield postDataToEndpoint(url, requestBody, headers);
            // update conversation history
            //conversation_history = conversation_history + "User: " + context.activity.text + "\nChatbot: " + data.choices[0].text + "\n"
            conversation_history = conversation_history + "<|im_start|>user " + context.activity.text + "<|im_end|>\n<|im_start|>assistant " + data.choices[0].text + "\n";
            // send response to user
            const replyText = `${data.choices[0].text.replace("<|im_end|>", "")} \n[~  ${data.usage.total_tokens} tokens]`;
            // const replyText = `Echox: ${ context.activity.text } value: ${ context.activity.value }`;
            yield context.sendActivity(botbuilder_1.MessageFactory.text(replyText));
            // By calling next() you ensure that the next BotHandler is run.
            yield next();
        }));
        this.onMembersAdded((context, next) => __awaiter(this, void 0, void 0, function* () {
            let botmessage;
            if (typeof process.env.BOT_MESSAGE !== 'undefined') {
                botmessage = process.env.BOT_MESSAGE;
            }
            else {
                botmessage = "こんにちは！ChatGPTです。何かお手伝いできることはありますか？";
            }
            const membersAdded = context.activity.membersAdded;
            const welcomeText = botmessage;
            // delete converstaion history
            conversation_history = "";
            for (const member of membersAdded) {
                if (member.id !== context.activity.recipient.id) {
                    yield context.sendActivity(botbuilder_1.MessageFactory.text(welcomeText, welcomeText));
                }
            }
            // By calling next() you ensure that the next BotHandler is run.
            yield next();
        }));
    }
}
exports.EchoBot = EchoBot;
//# sourceMappingURL=bot.js.map