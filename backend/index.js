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
console.log(`AWS Config: Region - ${process.env.AWS_REGION}`);

app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} request to ${req.originalUrl} from ${req.ip}`);
  next();
});

app.use(bodyParser.json());
const corsOptions = {
  origin: '*',
  methods: 'GET,POST',
  allowedHeaders: 'Content-Type,Authorization',
};


app.use(cors(corsOptions));

app.options('*', cors(corsOptions)); 

app.post('/api/text-to-audio-file', async (req, res) => {


  
  console.log(`AWS Config: Region - ${process.env.AWS_REGION}`);

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

    console.log(chatCompletion)

    await polly.synthesizeSpeech(params, (err, data) => {

      return res.send(JSON.stringify("polly" + data));

    });

  } catch {
    return res.send("asdfasgd");
  }

  /*
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
  
      // Synthesize speech using AWS Polly
      polly.synthesizeSpeech(params, (err, data) => {
        if (err) {
          //console.error(err);
          console.error(`Error with AWS Polly: ${err.stack}`);
          //return res.status(500).json({ error: err.message });
          return res.send("Polly broke or something");
        }
  
        let filePath = "../public/voice/";
        let fileName = `${Date.now()}.mp3`; // Use current timestamp to avoid collisions
  
        // Save the audio file
        fs.writeFileSync(filePath + fileName, data.AudioStream);
        console.log(`Successfully created audio file: ${fileName}`);
  
        // Send the file name as a response
        // res.status(200).json({ fileName: fileName });
        return res.send(JSON.stringify({fileName: fileName }));
        
      });
    } catch (error) {
      //console.error("Error generating audio file:", error);
      console.error(`Error in POST /api/text-to-audio-file: ${error.stack}`);
      return res.send("Something broke");
      //res.status(500).json({ error: error.message });
    } */
  });
  
  // Start the server
  app.listen(4001, () => {
    console.log(`Server is ready at + proccess.env.SERVER_URL `);
    console.log(`Server is ready at http://localhost:4001`);
    console.log(`AWS Config: Region - ${process.env.AWS_REGION}`);
  });

  app.get('/health', (req, res) => {
    res.status(200).send('OK');
  });

