require('dotenv').config();
const express = require("express");
const app = express();
const cors = require("cors");
const bodyParser = require("body-parser");
const fs = require("fs");
const OpenAI = require("openai");
const AWS = require("aws-sdk");

const openai = new OpenAI({
  apiKey: process.env.OPEN_AI_API_KEY
  });

// aws config
AWS.config.update({
  accessKeyId: process.env.ACCESS_KEY_ID, secretAccessKey: process.env.SECRET_ACCESS_KEY, region: process.env.AWS_REGION
});

app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} request to ${req.originalUrl} from ${req.ip}`);
  next();
});

app.use(bodyParser.json());

app.use(cors());

app.use('/voice', express.static('voice'));

app.get('/api/proxy-audio/:filename', (req, res) => {
  const filename = req.params.filename;
  const filePath = `voice/${filename}`;

  // Stream the audio file from the 'voice' directory
  const fileStream = fs.createReadStream(filePath);
  fileStream.pipe(res);
});

app.post('/api/text-to-audio-file', async (req, res) => {
  try {
    // Generate a completion using OpenAI
    const chatCompletion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: req.body.text }],
      max_tokens: 100,
      //temperature: 0.5
    });
    const polly = new AWS.Polly();
    const params = {
      OutputFormat: "mp3",
      Text: chatCompletion.choices[0].message.content, 
      VoiceId: "Matthew" 
    };

    polly.synthesizeSpeech(params, (err, data) => {
      if (err) {
        console.error(err);
      }

      // Update the file path to include the "voice" directory
      let filePath = "voice/";
      let fileName = `${Date.now()}.mp3`; // Use current timestamp to avoid collisions

      // Check if the directory exists, if not, create it
      if (!fs.existsSync(filePath)) {
        fs.mkdirSync(filePath, { recursive: true }); // recursive: true ensures nested directories are created if they don't exist
      }

      try {
        fs.writeFileSync(filePath + fileName, data.AudioStream);
        console.log(`File successfully saved to: ${filePath + fileName}`)
        res.send(fileName); // Send just the fileName or a relative path

      } catch (writeError) {
        console.error("Error writing file:", writeError);
        return res.status(500).send("Error saving audio file");
      }
    });

  } catch {
    return res.send("asdfasgd");
  }
  });
  
  // Start the server
  app.listen(4001, () => {
    console.log(`Server is ready at http://localhost:4001`);
  });

  app.get('/health', (req, res) => {
    res.status(200).send('OK');
  });

