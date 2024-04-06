const express = require("express");
const app = express();
const cors = require("cors");
const bodyParser = require("body-parser");
const fs = require("fs");
const OpenAI = require("openai");

const openai = new OpenAI({
    apiKey: '',
  });

const AWS = require("aws-sdk");
AWS.config.loadFromPath("awsCreds.json");

app.use(bodyParser.json());
app.use(cors());

app.post('/api/text-to-audio-file', async (req, res) => {
    try {
      // Generate a completion using OpenAI
      const chatCompletion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: req.body.text }],
        max_tokens: 100,
        temperature: 0.5
      });
  
      const polly = new AWS.Polly({ region: "us-east-1" });
      const params = {
        OutputFormat: "mp3",
        Text: chatCompletion.choices[0].message.content, // Adjusted to match the new response structure
        VoiceId: "Matthew" // Corrected "VoiceID" to "VoiceId"
      };
  
      // Synthesize speech using AWS Polly
      polly.synthesizeSpeech(params, (err, data) => {
        if (err) {
          console.error(err);
          return res.status(500).json({ error: err.message });
        }
  
        let filePath = "../public/voice/";
        let fileName = `${Date.now()}.mp3`; // Use current timestamp to avoid collisions
  
        // Save the audio file
        fs.writeFileSync(filePath + fileName, data.AudioStream);
  
        // Send the file name as a response
        res.status(200).json({ fileName: fileName });
      });
    } catch (error) {
      console.error("Error generating audio file:", error);
      res.status(500).json({ error: error.message });
    }
  });
  
  // Start the server
  app.listen(4001, () => {
    console.log(`Server is ready at http://localhost:4001`);
  });

