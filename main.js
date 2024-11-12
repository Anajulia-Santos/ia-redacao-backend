// node --version # Should be >= 18
// npm install @google/generative-ai
const https = require('https');
const fs = require('fs');
const express = require('express')
const cors = require('cors')

const {
  GoogleGenerativeAI,
  HarmCategory,
  HarmBlockThreshold,
} = require("@google/generative-ai");

const app = express()
app.use(express.json());
app.use(express.urlencoded({extended:true}))
app.use(cors())

const options = {
  key: fs.readFileSync('cert/cert.key'),
  cert: fs.readFileSync('cert/cert.crt')
};


const MODEL_NAME = "gemini-1.5-pro-latest";
const API_KEY = "AIzaSyCJaPodG3Xf5B6_fujoKtyqRpgXaxiaaFo";


const genAI = new GoogleGenerativeAI(API_KEY);
const model = genAI.getGenerativeModel({ model: MODEL_NAME });

const generationConfig = {
  temperature: 1,
  topK: 1,
  topP: 1,
  maxOutputTokens: 2048,
};

const safetySettings = [
  {
    category: HarmCategory.HARM_CATEGORY_HARASSMENT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
];

history: [
  {
    role: "user",
    parts: [
      {
        text: "A função da correção da redação será avaliar as competências do ENEM, identificando as incorreções e sugerindo melhorias."
      }
    ]
  },
  {
    role: "model",
    parts: [
      {
        text: "A função será corrigir as redações de acordo com as competências do ENEM, mostrando os pontos incorretos, como erros de gramática, estrutura e argumentação, e oferecendo sugestões de melhorias, como ajustes na clareza, coerência e coesão do texto. A correção também incluirá dicas para aprimorar a argumentação e a articulação das ideias."
      }
    ]
  }
]


const chat = model.startChat({
  generationConfig,
  safetySettings,
  history: [],
});

async function runChat(pergunta) {
  const result = await chat.sendMessage(pergunta);
  const response = result.response;
  return response.text()
}


app.post('/ia', async (req,res)=>{
  const {redacao} = req.body

  if(redacao != ""){
    const texto = await runChat(redacao)
    res.json({status:true, msg: texto})
  }
  else{
    res.json({status:false})
  }

})

app.listen(process.env.PORT || 3000, () => console.log('Servidor Online'))

//https.createServer(options, app).listen(3000)


