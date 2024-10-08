const fs = require('fs');
const levenshtein = require('fast-levenshtein');
const { NlpManager } = require('node-nlp');

// Tokenize text into words
function tokenize(text) {
    return text.split(/\s+/);
}

// Build the Markov chain from the text
function buildMarkovChain(text) {
    const words = tokenize(text);
    const markovChain = {};

    for (let i = 0; i < words.length - 1; i++) {
        const word = words[i].toLowerCase();
        const nextWord = words[i + 1].toLowerCase();

        if (!markovChain[word]) {
            markovChain[word] = [];
        }

        markovChain[word].push(nextWord);
    }

    return markovChain;
}

// Load suggestions from file
function loadSuggestions(filePath) {
    const data = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(data);
}

// Autocorrect-style phrase suggestion
function suggestPhrase(word, suggestions) {
    return suggestions[word.toLowerCase()] || null;
}

// Generate text using Markov chain with occasional autocorrect suggestions
function generateResponse(chain, inputText, suggestions, length = 50, requiredWords = []) {
    const words = tokenize(inputText);
    let currentWord = words[0].toLowerCase();
    let result = [currentWord];
    let requiredWordsIndex = 0;

    for (let i = 0; i < length - 1; i++) {
        // 50% chance to use autocorrect suggestions
        if (Math.random() > 0.5) {
            const phrase = suggestPhrase(currentWord, suggestions);
            if (phrase) {
                // Add autocorrected phrase and update the current word
                result.push(phrase);
                currentWord = tokenize(phrase).slice(-1)[0]; // Use the last word of the phrase as the next word
                continue;
            }
        }

        // Check if we need to include a required word
        if (requiredWordsIndex < requiredWords.length) {
            const requiredWord = requiredWords[requiredWordsIndex];
            result.push(requiredWord);
            currentWord = requiredWord;
            requiredWordsIndex++;
            continue;
        }

        // Otherwise, use the Markov chain to pick the next word
        const nextWords = chain[currentWord];
        if (!nextWords || nextWords.length === 0) {
            // If no next word, randomly pick a new word from the chain
            const allWords = Object.keys(chain);
            currentWord = allWords[Math.floor(Math.random() * allWords.length)];
        } else {
            // Pick a random next word from the Markov chain
            currentWord = nextWords[Math.floor(Math.random() * nextWords.length)];
        }

        result.push(currentWord);
    }

    return result.join(' ');
}

// Function to run a grammar correction using node-nlp
async function grammarCheck(text) {
    const manager = new NlpManager({ languages: ['en'] });
    const response = await manager.process('en', text);

    // Ensure that the response contains sentences before attempting to correct
    if (response.sentiment && response.sentiment.sentences) {
        const corrections = response.sentiment.sentences.map(sentence => {
            return sentence.utterance; // Return the corrected sentence
        });

        // Reconstruct the text with corrected sentences
        return corrections.join(' ');
    } else {
        // If no sentences are found, return the original text as a fallback
        return text;
    }
}

// Function to generate a response based on the input with grammar correction
async function generateMarkovResponse(inputText) {
    const text = fs.readFileSync('corpus.txt', 'utf8');
    const markovChain = buildMarkovChain(text);
    const suggestions = loadSuggestions('suggestions.json');

    const words = tokenize(inputText);
    const longestWords = words.sort((a, b) => b.length - a.length).slice(0, 2);
    const randomWords = words.filter((word, index) => index !== words.indexOf(longestWords[0]) && index !== words.indexOf(longestWords[1]));
    const randomWordsSample = randomWords.length >= 4 ? randomWords.slice(0, 4) : randomWords;
    const requiredWords = [...longestWords, ...randomWordsSample];

    // Shuffle the required words
    for (let i = requiredWords.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [requiredWords[i], requiredWords[j]] = [requiredWords[j], requiredWords[i]];
    }

    const generatedText = generateResponse(markovChain, inputText, suggestions, 30, requiredWords);

    // Run grammar correction on the generated response
    const correctedResponse = await grammarCheck(generatedText);
    return correctedResponse;
}

// Function to generate a response based on the input with grammar check
async function generateMarkovResponse(inputText) {
    const text = fs.readFileSync('corpus.txt', 'utf8');
    const markovChain = buildMarkovChain(text);
    const suggestions = loadSuggestions('suggestions.json');

    const words = tokenize(inputText);
    const longestWords = words.sort((a, b) => b.length - a.length).slice(0, 2);
    const randomWords = words.filter((word, index) => index !== words.indexOf(longestWords[0]) && index !== words.indexOf(longestWords[1]));
    const randomWordsSample = randomWords.length >= 4 ? randomWords.slice(0, 4) : randomWords;
    const requiredWords = [...longestWords, ...randomWordsSample];

    // Shuffle the required words
    for (let i = requiredWords.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [requiredWords[i], requiredWords[j]] = [requiredWords[j], requiredWords[i]];
    }

    const generatedText = generateResponse(markovChain, inputText, suggestions, 30, requiredWords);

    // Run grammar check on the generated response
    const checkedResponse = await grammarCheck(generatedText);
    return checkedResponse;
}

module.exports = { generateMarkovResponse };
