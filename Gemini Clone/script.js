// script.js - This code helps your Gemini Clone chat!

// This line waits until the whole web page (HTML) is loaded before running our JavaScript.
// It's like waiting for all the furniture to be in the room before you start moving around in it.
document.addEventListener('DOMContentLoaded', () => {

    // --- Part 1: Finding Our HTML Parts ---
    // We need to find the specific parts of our web page that we want to interact with.
    // Think of these as "elements" on the page, like a button or a text box.
    // We use `document.getElementById()` to grab an element by its unique `id` attribute.

    const userInput = document.getElementById('user-input'); // This is the text box where you type your questions.
    const sendButton = document.getElementById('send-button'); // This is the button you click to send your message.
    const chatMessages = document.getElementById('chat-messages'); // This is the big area where all the chat messages show up.
    const loadingIndicator = document.getElementById('loading-indicator'); // This is the "Thinking..." message that appears when Gemini is responding.

    // --- Part 2: Helper Functions (Little Jobs Our Code Does) ---

    // Function 1: Make the chat screen scroll down automatically.
    // When a new message appears, we want to see it right away!
    const scrollToBottom = () => {
        // `scrollHeight` is the total height of the content in the chat area.
        // Setting `scrollTop` to this value makes it scroll all the way to the bottom.
        chatMessages.scrollTop = chatMessages.scrollHeight;
    };

    // Function 2: Show a message in the chat.
    // This function takes two pieces of information:
    // `text`: The actual message content (what Gemini or you said).
    // `sender`: Who sent the message ('user' for you, 'gemini' for the AI).
    const displayMessage = (text, sender) => {
        // First, we create a new `div` (which is like a new box) for this message.
        const messageDiv = document.createElement('div');

        // Then, we add some "classes" to this new box. Classes are like labels
        // that tell our CSS (style.css) how to make the message look.
        // `message`: Basic styling for all messages.
        // `from-user` or `from-gemini`: Tells CSS if it's your message (on the right, blue)
        //                               or Gemini's message (on the left, gray).
        // `shadow-md`: Adds a subtle shadow.
        // `animate-fade-in`: Makes the message smoothly fade in when it appears.
        messageDiv.classList.add('message', `from-${sender}`, 'shadow-md', 'animate-fade-in');

        // Now, we put the actual message text inside our new message box.
        // We replace special `\n` (newline) characters with `<br>` (HTML line break)
        // so that the text shows up on separate lines if it was typed that way.
        const formattedText = text.replace(/\n/g, '<br>');
        messageDiv.innerHTML = `<p>${formattedText}</p>`;

        // Finally, we add this new message box to our main chat area.
        chatMessages.appendChild(messageDiv);

        // After adding the message, make sure we scroll to the bottom!
        scrollToBottom();
    };

    // --- Part 3: The Big Job (Sending Your Message to Gemini) ---

    // This is the main function that runs when you want to send a message.
    // It's an `async` function because it needs to wait for a response from the internet (Gemini API).
    const sendMessage = async () => {
        // Get the text from the input box and remove any empty spaces from the beginning or end.
        const prompt = userInput.value.trim();

        // If the input box is empty, don't do anything! Just stop here.
        if (prompt === '') {
            return;
        }

        // Step 1: Show YOUR message in the chat.
        displayMessage(prompt, 'user');
        // Clear the input box so it's ready for your next message.
        userInput.value = '';
        // Reset the height of the input box in case it grew bigger.
        userInput.style.height = 'auto';

        // Step 2: Show the "Thinking..." indicator.
        // We remove the 'hidden' class to make it visible.
        loadingIndicator.classList.remove('hidden');
        // Scroll down to make sure you see the loading indicator.
        scrollToBottom();

        // Step 3: Prepare your message to send to the Gemini AI.
        // The Gemini API expects messages in a specific format (a list of objects).
        // For now, we just put your current message into this list.
        let chatHistory = [];
        chatHistory.push({ role: "user", parts: [{ text: prompt }] });

        // This is the data that will be sent to the Gemini API.
        const payload = {
            contents: chatHistory // Our chat messages go here.
        };

        // IMPORTANT: You need your own API Key to talk to Gemini!
        // Replace "YOUR_GEMINI_API_KEY" with the actual key you get from Google AI Studio.
        // Keep this key secret and don't share it publicly!
        const apiKey = "YOUR-API-KEY"; // Get this from ai.google.dev
        // This is the internet address (URL) of the Gemini AI model we want to use.
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

        // Step 4: Try to send the message to Gemini and get a reply.
        // We use a `try...catch` block to handle any errors that might happen.
        try {
            // `fetch()` is a powerful command to send requests over the internet.
            // We tell it to send a 'POST' request (meaning we're sending data)
            // and that the data is in JSON format.
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload) // Convert our JavaScript 'payload' into a JSON string.
            });

            // Check if the response was successful (e.g., did not get a 403 or 500 error).
            if (!response.ok) {
                // If there was an error, try to get more details about it.
                const errorData = await response.json();
                // Create an error message that we can display.
                throw new Error(`API error: ${response.status} - ${errorData.error.message || 'Unknown error'}`);
            }

            // If the response was successful, get the actual data from Gemini.
            const result = await response.json();

            // Step 5: Display Gemini's reply.
            // We check if Gemini actually sent some content back.
            if (result.candidates && result.candidates.length > 0 &&
                result.candidates[0].content && result.candidates[0].content.parts &&
                result.candidates[0].content.parts.length > 0) {
                // Get the text part of Gemini's response.
                const geminiText = result.candidates[0].content.parts[0].text;
                // Show Gemini's message in the chat!
                displayMessage(geminiText, 'gemini');
            } else {
                // If Gemini didn't send a proper response, show a friendly error.
                displayMessage('Sorry, I could not generate a response. Please try again.', 'gemini');
            }

        } catch (error) {
            // If any error happened (like wrong API key, no internet), this code runs.
            console.error('An error occurred:', error); // Print the error to the browser's console (for developers).
            displayMessage(`An error occurred: ${error.message}. Please make sure your API key is correct.`, 'gemini');
        } finally {
            // This part runs no matter what (if there was an error or not).
            // Step 6: Hide the "Thinking..." indicator.
            loadingIndicator.classList.add('hidden'); // Add the 'hidden' class back to make it invisible.
            scrollToBottom(); // Ensure we're at the bottom after everything is done.
        }
    };

    // --- Part 4: Making Things Happen (Event Listeners) ---

    // We need to tell our code to do something when certain events happen.

    // When the 'Send' button is CLICKED, run the `sendMessage` function.
    sendButton.addEventListener('click', sendMessage);

    // When a key is PRESSED in the input box...
    userInput.addEventListener('keypress', (event) => {
        // If the key pressed was 'Enter' AND the 'Shift' key was NOT pressed...
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault(); // Stop the default 'Enter' behavior (which is usually adding a new line in the text box).
            sendMessage(); // Send the message!
        }
    });

    // Make the input text box grow in height as you type more lines.
    userInput.addEventListener('input', function () {
        this.style.height = 'auto'; // Reset the height first.
        this.style.height = (this.scrollHeight) + 'px'; // Set height based on how much content is inside.
    });
});
