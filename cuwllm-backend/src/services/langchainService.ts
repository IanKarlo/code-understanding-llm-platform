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
                `Please provide a detailed explanation of this code snippet. Include the purpose of the code, a breakdown of its components, and any important concepts or functions used. Do not repeat the code in your explanation.\n\n${code}`
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
                `Please provide a comprehensive analysis of this file. Your explanation should include:
                1. Overall purpose and functionality of the file
                2. Key components and their relationships
                3. Important classes, functions, and their purposes
                4. Any notable patterns or design decisions
                5. Dependencies and their usage
                6. Potential areas of interest or complexity

                Do not repeat any code in your explanation.

                Here is the file content:

                ${fileContent}`
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
                `Please analyze this multi-file codebase. Each file is marked with '## File X' at the start and '#endfile' at the end. 
                
                Provide a detailed explanation that includes:
                1. Overall architecture and purpose of the codebase
                2. Analysis of each file's role and responsibility
                3. Key interactions and dependencies between files
                4. Important classes, functions, and their relationships across files
                5. Notable design patterns or architectural decisions
                6. Data flow between components
                7. Any potential improvements or areas of interest

                Do not include any code snippets in your explanation.

                Here are the files:

                ${filesContent}`
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
                `Please provide a clear and detailed answer to the following question. If the question is about code or technical concepts, include relevant examples and explanations.

                Question: ${question}`
            );
            return response.content;
        } catch (error) {
            console.error('Error in LangChain service:', error);
            throw new Error('Failed to process question');
        }
    }
}

export const langChainService = new LangChainService(); 