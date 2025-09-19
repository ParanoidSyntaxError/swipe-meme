import OpenAI from "openai";
import { getNewestPumpfunTokens } from "../pumpfun/tokens";
import { PromptedIdea } from "./types";

const openAiClient = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

export async function promptIdeas(count: number): Promise<PromptedIdea[] | null> {
    try {
        const newPfTokens = await getNewestPumpfunTokens();
        if (!newPfTokens) {
            return null;
        }

        const response = await openAiClient.responses.create({
            model: "gpt-5-mini",
            reasoning: { effort: "low" },
            instructions: (
                "Generate unique meme coins based on a list of recently deployed pumpfun meme coins. " +
                "The meme coins should stay within the format and style of pumpfun meme coins. " +
                "Your output should be a JSON array of objects with the following string properties: name, symbol, description and imageQuery. " +
                "The symbol should be limited to at most 6 characters, but as short as possible. " +
                "The description should be a short description of the meme coin. " +
                "The imageQuery should be a query string to search for an image related to the meme coin on the Openverse API image search. " +
                "Ensure the imageQuery is in the Openverse image search format (the q parameter on the /images/ Openverse API endpoint). " +
                "The imageQuery should use general terms still related to the meme coin, try to use broad terms that will return a lot of images, but still be related to the meme coin. " +
                "Limit the imageQuery to at most 2 words, and don't use style terms like 'illustration', 'cartoon', 'art', 'image', 'photo', etc. " +
                "Take inspiration from the newest pumpfun meme coins, but make sure to be unique and creative. " +

                "Try varying the meme coins you generate, make some in the style of a shitpost, " +
                "some in a sarcastic style, some in the style of a crypto degen, some in the style of a crypto meme, " +
                "some in the style of a serious crypto project, etc. " +
                "Don't include your style in the description, keep the description in the style of the meme coins. " +

                "Don't include any other text than the JSON array of objects."
            ),
            input: (
                `Generate ${count} unique meme coins based on the following newest pumpfun meme coins: ` +
                newPfTokens.map(token => JSON.stringify(token)).join(", ")
            ),
        });
        if (response.error) {
            console.error("Error generating token ideas:", response.error);
            return null;
        }

        const ideas: PromptedIdea[] = JSON.parse(response.output_text);
        return ideas.map(idea => ({
            ...idea,
            imageQuery: idea.imageQuery.replace("q=", "").replaceAll("+", "|").replaceAll(" ", "+")
        }));
    } catch (error) {
        console.error("Error generating ideas:", error);
        return null;
    }
}