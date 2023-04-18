// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

import { ActivityHandler, MessageFactory } from 'botbuilder';
import axios, { AxiosResponse, AxiosRequestHeaders } from 'axios';
import { aoaiParam } from './global';

export class EchoBot extends ActivityHandler {
    constructor() {
        super();

        interface RequestBody {
            prompt: string;
            max_tokens: number;
            temperature: number;
            // presence_penalty: string;
            // frequency_penalty: string;

        }

        interface OpenAiResponse {
            choices: [
                {
                    text: string;
                }
            ],
            usage: {
                total_tokens: number;
            }
        }

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
        } else {
            systemim = "高度なチャットボットとしての主な目標は、ユーザーの能力を最大限に発揮できるようにすることです。これには、質問への回答、役立つ情報の提供、またはユーザー入力に基づくタスクの補完が含まれる場合があります。ユーザーを効果的に支援するためには、詳細かつ徹底した対応が重要です。例と証拠を使用して、ポイントを裏付け、正当な推奨事項や解決策を提示します。";
        }

        let prompt = `<|im_start|>system ${systemim}<|im_end|>

        <conversation history>

        <|im_start|>user <user input><|im_end|>

        <|im_start|>assistant`
        let originurl: string;
        let model: string;
        let apikey: string;
        if (typeof process.env.AOAI_ENDPOINT !== 'undefined' && typeof process.env.AOAI_MODEL_NAME !== 'undefined' && typeof process.env.AOAI_API_KEY !== 'undefined') {
            originurl = process.env.AOAI_ENDPOINT;
            model = process.env.AOAI_MODEL_NAME;
            apikey = process.env.AOAI_API_KEY;
        } else {
            throw new Error(`Some of variables AOAI_ENDPOINT, AOAI_MODEL_NAME, AOAI_API_KEY is not defined.`);
        }
        const url = `${originurl}openai/deployments/${model}/completions?api-version=2022-12-01`;
 
        let conversation_history = "";

        const headers = {
            'Content-Type': 'application/json',
            // 'Authorization': 'Bearer YOUR_TOKEN'
            'api-key': apikey
        };

        async function postDataToEndpoint(url: string, requestBody: RequestBody, headers: AxiosRequestHeaders): Promise<OpenAiResponse> {
            try {
              const response: AxiosResponse = await axios.post(url, requestBody, {headers});
              return response.data;
            } catch (error) {
              throw new Error(`Error posting data to ${url}: ${error}`);
            }
        }

        // See https://aka.ms/about-bot-activity-message to learn more about the message and other activity types.
        this.onMessage(async (context, next) => {
            
            // construct prompt
            let tmp_prompt = prompt.replace("<conversation history>", conversation_history).replace("<user input>", context.activity.text)
            
            // construct request body
            const aoaiParamVar = new aoaiParam();
            let aoaitoken = aoaiParamVar.getToken();
            let aoaitemp = aoaiParamVar.getTemp();
            const requestBody =     {
                prompt: tmp_prompt
                , max_tokens: aoaitoken
                , temperature: aoaitemp
                // , presence_penalty: "0.0"
                // , frequency_penalty: "0.0"
            };

            // send request to openai
            const data = await postDataToEndpoint(url, requestBody, headers);

            // update conversation history
            //conversation_history = conversation_history + "User: " + context.activity.text + "\nChatbot: " + data.choices[0].text + "\n"
            conversation_history = conversation_history + "<|im_start|>user " + context.activity.text + "<|im_end|>\n<|im_start|>assistant " + data.choices[0].text + "\n"
            // send response to user
            const replyText = `${ data.choices[0].text.replace("<|im_end|>", "") } \n[~  ${data.usage.total_tokens} tokens]`;
            // const replyText = `Echox: ${ context.activity.text } value: ${ context.activity.value }`;
            await context.sendActivity(MessageFactory.text(replyText));
            
            // By calling next() you ensure that the next BotHandler is run.
            await next();
        });

        this.onMembersAdded(async (context, next) => {
            let botmessage: string;
            if (typeof process.env.BOT_MESSAGE !== 'undefined') {
                botmessage = process.env.BOT_MESSAGE;
            } else {
                botmessage = "こんにちは！ChatGPTです。何かお手伝いできることはありますか？";
            }
    
            const membersAdded = context.activity.membersAdded;
            const welcomeText = botmessage;
            // delete converstaion history
            conversation_history = ""
            for (const member of membersAdded) {
                if (member.id !== context.activity.recipient.id) {
                    await context.sendActivity(MessageFactory.text(welcomeText, welcomeText));
                }
            }
            // By calling next() you ensure that the next BotHandler is run.
            await next();
        });
    }
}
