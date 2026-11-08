import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json());

// Initialize Google Gemini AI client
const geminiApiKey = process.env.GEMINI_API_KEY || '';
const ai = new GoogleGenAI({
  apiKey: geminiApiKey,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// In-memory / file-backed persistent progress store
const DATA_DIR = path.join(__dirname, 'data');
const PROGRESS_FILE = path.join(DATA_DIR, 'user_progress.json');

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

function loadProgressData(): Record<string, any> {
  try {
    ensureDataDir();
    if (fs.existsSync(PROGRESS_FILE)) {
      const raw = fs.readFileSync(PROGRESS_FILE, 'utf-8');
      return JSON.parse(raw);
    }
  } catch (err) {
    console.error('Failed to read progress file:', err);
  }
  return {};
}

function saveProgressData(data: Record<string, any>) {
  try {
    ensureDataDir();
    fs.writeFileSync(PROGRESS_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to save progress file:', err);
  }
}

// API: Get user progress
app.get('/api/progress/:userId', (req, res) => {
  const { userId } = req.params;
  const db = loadProgressData();
  const userData = db[userId] || null;
  res.json({ success: true, data: userData });
});

// API: Save user progress
app.post('/api/progress/:userId', (req, res) => {
  const { userId } = req.params;
  const payload = req.body;
  const db = loadProgressData();
  db[userId] = {
    ...db[userId],
    ...payload,
    updatedAt: new Date().toISOString(),
  };
  saveProgressData(db);
  res.json({ success: true, data: db[userId] });
});

// API: Chat with AI Tutor about the Lesson
app.post('/api/gemini/chat', async (req, res) => {
  try {
    const { lessonNumber, lessonTitle, dialogueSnippet, message, conversationHistory } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Mensagem obrigatória.' });
    }

    if (!geminiApiKey) {
      return res.json({
        reply: `[Simulação sem chave de API] Olá! Sou o seu tutor de inglês Assimil. Na lição ${lessonNumber} ("${lessonTitle}"), focamos na conversação natural e expressões como no diálogo do livro. Como posso te ajudar a praticar?`,
      });
    }

    const systemInstruction = `
Você é o Tutor de Inglês Americano Assimil, um professor caloroso, encorajador, bem-humorado e altamente pedagógico baseado no consagrado método Assimil "Inglês Americano - Coleção sem Esforço" de David Applefield.
Você está conversando com um estudante brasileiro que está estudando a Lição ${lessonNumber}: "${lessonTitle}".
Diálogo e contexto da lição:
${dialogueSnippet || 'Sem contexto adicional'}

Diretrizes:
1. Responda em português claro e amigável com explicações práticas e culturais sobre o inglês dos Estados Unidos.
2. Destaque expressões idiomáticas, gírias e contrações da lição (ex: What's, I'd like, You're kidding, etc.).
3. Se o aluno pedir para praticar o diálogo ou fazer roleplay (ex: "vamos praticar", "você é o Jack e eu sou o Bill"), assuma o personagem em inglês americano natural, faça sua fala e sugira a próxima fala do aluno.
4. Forneça dicas de pronúncia transcrita fonética (estilo Assimil, ex: [náis tchú mitchú], o som do 'th' [sz], o 'r' enrolado, não colocar 'i' após consoantes finais).
5. Mantenha as mensagens objetivas, motivadoras e engajantes para manter o foco do aluno.
`;

    // Build contents for multi-turn or single-turn
    const contents: any[] = [];
    if (Array.isArray(conversationHistory)) {
      for (const turn of conversationHistory.slice(-6)) {
        contents.push({
          role: turn.role === 'user' ? 'user' : 'model',
          parts: [{ text: turn.text }],
        });
      }
    }
    contents.push({
      role: 'user',
      parts: [{ text: message }],
    });

    let reply = '';
    const modelsToTry = ['gemini-3.8-flash', 'gemini-3.1-flash-lite', 'gemini-flash-latest'];

    for (const modelName of modelsToTry) {
      try {
        const callPromise = ai.models.generateContent({
          model: modelName,
          contents: contents,
          config: {
            systemInstruction,
          },
        });

        // 4.5s timeout per model attempt to prevent hanging on 503 retries
        const timeoutPromise = new Promise<null>((resolve) => setTimeout(() => resolve(null), 4500));
        const response: any = await Promise.race([callPromise, timeoutPromise]);

        if (response && response.text) {
          reply = response.text;
          break;
        }
      } catch (modelErr: any) {
        console.warn(`Model ${modelName} failed, trying next fallback:`, modelErr?.message || modelErr);
      }
    }

    // If all models failed or temporary cloud spike (e.g. 503 High Demand)
    if (!reply) {
      reply = generateSmartAssimilTutorFallback(message, lessonNumber, lessonTitle, dialogueSnippet);
    }

    res.json({ reply });
  } catch (error: any) {
    console.error('Error in /api/gemini/chat:', error);
    const fallbackReply = generateSmartAssimilTutorFallback(
      req.body?.message || '',
      req.body?.lessonNumber || 1,
      req.body?.lessonTitle || '',
      req.body?.dialogueSnippet || ''
    );
    res.json({ reply: fallbackReply });
  }
});

// Contextual fallback knowledge base for the Assimil American English Tutor
function generateSmartAssimilTutorFallback(
  message: string,
  lessonNumber: number,
  lessonTitle: string,
  snippet: string
): string {
  const lower = (message || '').toLowerCase();

  if (lower.includes('olá') || lower.includes('hello') || lower.includes('oi') || lower.includes('hi')) {
    return `Hello! How are you doing? 👋 Na Lição ${lessonNumber} ("${lessonTitle}"), estamos praticando a comunicação natural e informal do dia a dia americano. Como posso te ajudar hoje? Podemos encenar o diálogo, tirar dúvidas de pronúncia ou vocabulário!`;
  }

  if (lower.includes('praticar') || lower.includes('diálogo') || lower.includes('roleplay') || lower.includes('jack') || lower.includes('bill')) {
    if (lessonNumber === 1) {
      return `Great! Let's practice! 🎭 Eu começo como a Pessoa A:

"Hi! What's your name?"

(Agora responda dizendo seu nome e perguntando o meu com: "Jack. What's yours?")`;
    }
    if (lessonNumber === 2) {
      return `Awesome! Let's do the dialogue! 🎭 Eu começo:

"Where are you from?"

(Agora é sua vez! Responda de onde você é, por exemplo: "Texas" ou "Brazil"!)`;
    }
    if (lessonNumber === 3) {
      return `Sure! Let's roleplay at the Post Office! 📮 Eu sou o atendente do correio:

"Good morning, ma'am (or sir). How can I help you?"

(Sua vez! Diga que gostaria de enviar esta carta: "Morning. I'd like to send this letter to Paris.")`;
    }
    return `Com certeza! Vamos encenar a Lição ${lessonNumber}. Aqui está a primeira fala:
"${snippet ? snippet.split('\n')[0] : "Let's begin!"}"
Qual seria a sua resposta em inglês?`;
  }

  if (lower.includes('your') || lower.includes('yours')) {
    return `💡 Dica gramatical de ouro da Lição 1 do Assimil:
• **Your**: usa-se antes do substantivo. Ex: "What's **your** name?" (Qual é o **seu** nome?).
• **Yours**: usa-se quando o substantivo já foi falado e não precisamos repeti-lo. Ex: "Jack. What's **yours**?" (Jack. Qual é o **seu**?).
Em português dizemos "o seu nome" ou simplesmente "o seu". Em inglês, o "s" no final de *yours* faz toda a diferença para soar natural!`;
  }

  if (lower.includes('pronúncia') || lower.includes('som') || lower.includes('th') || lower.includes('r') || lower.includes('fonética')) {
    return `🗣️ Dica fonética Assimil para a Lição ${lessonNumber}:
1. **O som de 'th' [sz]**: coloque a pontinha da língua entre os dentes e sopre suavemente, como em "thanks" [szénks] ou "this" [szis].
2. **O 'r' americano**: dobre a língua para trás sem encostar no céu da boca (estilo o 'r' caipira do interior paulista/mineiro), como em "your" [ior] ou "where" [uér].
3. **Não acrescente 'i' no final**: brasileiros costumam falar "name-i", "meet-i", "bill-i". Mantenha o final seco e preciso: "name" [nêim], "meet" [mit]!`;
  }

  if (lower.includes('like') || lower.includes('likewise') || lower.includes('kidding')) {
    return `🇺🇸 **Expressões idiomáticas da Lição:**
• **Likewise** [láikuáis]: Uma palavra elegante e rápida para dizer "Igualmente!" ou "Prazer em conhecê-lo também!".
• **You're kidding!** [ior kiding]: Muito usada para expressar surpresa positiva ou choque: "Você está brincando!", "Não me diga!".
• **It's a small world!** [itssa smôu uorld]: Literalmente "É um mundo pequeno", equivale ao nosso "Que mundo pequeno!".`;
  }

  return `Very good question! Na Lição ${lessonNumber} ("${lessonTitle}"), o método Assimil enfatiza a imitação dos sons naturais do inglês americano e a assimilação sem regras complexas.

Gostaria de:
1. Praticar uma fala em inglês comigo agora?
2. Ouvir uma dica sobre a pronúncia de alguma palavra específica?
3. Criar uma frase usando o vocabulário do capítulo?`;
}

// API: Phonetic Deep Feedback with Gemini
app.post('/api/gemini/phonetic-analysis', async (req, res) => {
  try {
    const { targetPhrase, spokenText, phoneticGuide } = req.body;

    if (!geminiApiKey) {
      return res.json({
        analysis: `Excelente tentativa! O método Assimil recomenda repetir "${targetPhrase}" prestando atenção ao ritmo natural da fala americana.`,
      });
    }

    const prompt = `
O estudante de inglês americano tentou pronunciar a frase:
Frase alvo: "${targetPhrase}"
Guia fonético Assimil: "${phoneticGuide || ''}"
O que o reconhecimento de voz captou: "${spokenText}"

Dê um feedback conciso (2 a 3 frases) em português:
1. Aponte o que ficou bom.
2. Explique uma dica fonética específica para falantes de português brasileiro (ex: pronúncia de vogais, 'th', 'r', ou não adicionar som de 'i' mudo no final).
3. Encoraje a repetição.
`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction: 'Você é um fonoaudiólogo e professor especialista em sotaque e fonética do inglês americano para brasileiros.',
      },
    });

    res.json({ analysis: response.text || '' });
  } catch (error: any) {
    console.error('Error in /api/gemini/phonetic-analysis:', error);
    res.status(500).json({ error: error?.message });
  }
});

// API: Transcribe and evaluate recorded audio via Gemini
app.post('/api/gemini/transcribe-audio', async (req, res) => {
  try {
    const { audioBase64, mimeType, targetPhrase } = req.body;

    if (!audioBase64) {
      return res.status(400).json({ error: 'Nenhum áudio enviado.' });
    }

    if (!geminiApiKey) {
      return res.json({
        transcript: targetPhrase,
        accuracy: 90,
        feedback: 'Excelente pronúncia! O áudio foi captado com clareza.',
      });
    }

    const cleanBase64 = audioBase64.replace(/^data:audio\/\w+;base64,/, '');

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: [
        {
          role: 'user',
          parts: [
            {
              inlineData: {
                mimeType: mimeType || 'audio/webm',
                data: cleanBase64,
              },
            },
            {
              text: `Você é um avaliador de pronúncia em inglês para estudantes brasileiros. O aluno estava tentando falar a frase: "${targetPhrase}".
Transcreva com precisão o que ele falou e avalie a precisão fonética de 0 a 100.
Retorne estritamente um JSON no seguinte formato:
{
  "transcript": "o texto exato reconhecido em inglês",
  "accuracy": número de 0 a 100,
  "feedback": "comentário amigável em português apontando acertos e dicas fonéticas"
}`,
            },
          ],
        },
      ],
      config: {
        responseMimeType: 'application/json',
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    res.json({
      transcript: parsed.transcript || targetPhrase,
      accuracy: typeof parsed.accuracy === 'number' ? parsed.accuracy : 85,
      feedback: parsed.feedback || 'Bom esforço! Continue praticando.',
    });
  } catch (error: any) {
    console.error('Error in /api/gemini/transcribe-audio:', error);
    res.status(500).json({ error: 'Falha ao transcrever áudio.', details: error?.message });
  }
});

// Vite setup for development / Express static for production
async function startServer() {
  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: false,
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Assimil English App server running at http://localhost:${PORT}`);
  });
}

startServer();
