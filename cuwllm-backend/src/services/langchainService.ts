import { GoogleGenerativeAI } from "@google/generative-ai";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { config } from '../config/environment';
import { MessageContent } from "@langchain/core/messages";
export class LangChainService {
    private model: ChatGoogleGenerativeAI;

    constructor() {
        this.model = new ChatGoogleGenerativeAI({
            apiKey: config.googleApiKey,
            modelName: "gemini-2.0-flash",
            maxOutputTokens: 2048,
            temperature: 0.0,
        });
    }

    async explainCode(code: string): Promise<MessageContent> {
        try {
            const response = await this.model.invoke(
                `Por favor, forneça uma análise abrangente deste trecho de código. Sua explicação deve incluir:
                1. Propósito geral e funcionalidade do trecho
                2. Funções importantes, variáveis e seus papéis

                Não repita nenhum código em sua explicação.
                Caso você não encontre alguma das regras acima, não adicione nada.
                Escreva o texto de forma mais direta, sem dividir muito em tópicos.
                
                Aqui está o trecho de código:
                
                ${code}
                
                A resposta da explicação deve estar em formato markdown e em PORTUGUÊS.
                `
            );
            return response.content;
        } catch (error) {
            console.error('Error in LangChain service:', error);
            throw new Error('Failed to process code explanation');
        }
    }

    async explainFile(fileContent: string): Promise<MessageContent> {

        try {
            const response = await this.model.invoke(
                `Por favor, forneça uma análise abrangente deste arquivo. Sua explicação deve incluir:
                1. Propósito geral e funcionalidade do trecho
                2. Funções importantes, variáveis e seus papéis


                Não repita nenhum código em sua explicação.
                Caso você não encontre alguma das regras acima, não adicione nada.
                Escreva o texto de forma mais direta, sem dividir muito em tópicos.

                Aqui está o conteúdo do arquivo:

                ${fileContent}
                
                A resposta da explicação deve estar em formato markdown e em PORTUGUÊS.
                `
            );

            return response.content;
        } catch (error) {
            console.error('Error in LangChain service:', error);
            throw new Error('Failed to process file explanation');
        }
    }

    async explainMultipleFiles(filesContent: string): Promise<MessageContent> {
        try {
            const response = await this.model.invoke(
                `Por favor, faça uma analise abrangente desta base de código com múltiplos arquivos. Cada arquivo está marcado com '## File X' no início e '#endfile' no final.
                
                Forneça uma explicação detalhada que inclua:
                1. Propósito geral e funcionalidade do trecho
                2. Funções importantes, variáveis e seus papéis

                Não inclua nenhum trecho de código em sua explicação.
                Caso você não encontre alguma das regras acima, não adicione nada.
                Escreva o texto de forma mais direta, sem dividir muito em tópicos.
                
                Aqui estão os arquivos:
                
                ${filesContent}
                
                A resposta da explicação deve estar em formato markdown e em PORTUGUÊS.
                `
            );
            return response.content;
        } catch (error) {
            console.error('Error in LangChain service:', error);
            throw new Error('Failed to process multi-file explanation');
        }
    }

    async askQuestion(question: string): Promise<MessageContent> {
        try {
            const response = await this.model.invoke(
                `Por favor, forneça uma resposta clara e detalhada para a seguinte pergunta. Se a pergunta for sobre código ou conceitos técnicos, inclua exemplos relevantes e explicações.

                Pergunta: ${question}`
            );
            return response.content;
        } catch (error) {
            console.error('Error in LangChain service:', error);
            throw new Error('Failed to process question');
        }
    }

    async askRepo(filesContent: string, question: string): Promise<MessageContent> {
        try {
            const response = await this.model.invoke(
                `Por favor, analise de forma abrangente a seguinte base de código e responda à pergunta com base em seu conteúdo. Cada arquivo na base de código está marcado com '## File X' no início e '#endfile' no final.

                Primeiro, entenda a base de código:
                1. Arquitetura geral e propósito
                2. Componentes principais e seus relacionamentos
                3. Funcionalidades e características importantes

                Em seguida, forneça uma resposta detalhada à pergunta, referenciando especificamente partes relevantes da base de código.
                A resposta deve estar em formato markdown e em português.
                Caso você não encontre alguma das regras acima, não adicione nada.

                Base de código:
                ${filesContent}

                Pergunta: ${question}

                Por favor, forneça uma resposta abrangente que aborde diretamente a pergunta enquanto aproveita seu entendimento da base de código fornecida.`
            );
            return response.content;
        } catch (error) {
            console.error('Error in LangChain service:', error);
            throw new Error('Failed to process repository question');
        }
    }
}

export const langChainService = new LangChainService(); 