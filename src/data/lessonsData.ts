import { Lesson } from '../types/lesson';
import { ASSIMIL_LESSONS } from './lessons';

interface LessonBlueprint {
  number: number;
  titleEn: string;
  titlePt: string;
  phoneticTitle: string;
  theme: string;
  isRevision?: boolean;
  phrases: Array<{
    speaker: string;
    en: string;
    pt: string;
    phonetic: string;
  }>;
  glossary: Array<{
    word: string;
    translation: string;
    phonetic: string;
  }>;
  noteTitle: string;
  noteContent: string;
}

const LESSON_CATALOG_3_TO_105: Array<{
  number: number;
  titleEn: string;
  titlePt: string;
  phoneticTitle: string;
  theme: string;
  isRevision?: boolean;
  keyVocab: Array<[string, string, string]>;
  sampleLines: Array<[string, string, string, string]>;
  grammarFocus: [string, string];
}> = [
  {
    number: 3,
    titleEn: 'At the Coffee Shop',
    titlePt: 'Na Cafeteria',
    phoneticTitle: '[æt ðə ˈkɔfi ʃɑp]',
    theme: 'Pedindo bebidas e lanches em uma cafeteria americana',
    keyVocab: [
      ['coffee', 'café', 'ˈkɔfi'],
      ['milk', 'leite', 'mɪlk'],
      ['sugar', 'açúcar', 'ˈʃʊgər'],
      ['muffin', 'bolinho / muffin', 'ˈmʌfɪn'],
      ['check', 'conta', 'tʃɛk'],
      ['waiter', 'garçom', 'ˈweɪtər'],
    ],
    sampleLines: [
      ['Waiter', 'Good morning! What would you like to order?', 'Bom dia! O que vocês gostariam de pedir?', 'gʊd ˈmɔrnɪŋ! wʌt wʊd ju laɪk tu ˈɔrdər?'],
      ['Sarah', 'I would like a large coffee with milk, please.', 'Eu gostaria de um café grande com leite, por favor.', 'aɪ wʊd laɪk ə lɑrdʒ ˈkɔfi wɪð mɪlk, pliz'],
      ['Bob', 'And for me, an orange juice and a blueberry muffin.', 'E para mim, um suco de laranja e um muffin de mirtilo.', 'ænd fɔr mi, ən ˈɔrəndʒ dʒus ænd ə ˈbluˌbɛri ˈmʌfɪn'],
      ['Waiter', 'Would you like any sugar with your coffee?', 'Você gostaria de açúcar no seu café?', 'wʊd ju laɪk ˈɛni ˈʃʊgər wɪð jʊr ˈkɔfi?'],
      ['Sarah', 'No sugar for me, thanks. Just a little milk.', 'Sem açúcar para mim, obrigada. Apenas um pouco de leite.', 'noʊ ˈʃʊgər fɔr mi, θæŋks. dʒʌst ə ˈlɪtəl mɪlk'],
      ['Bill', 'Can I have a cup of hot tea with lemon?', 'Posso tomar uma xícara de chá quente com limão?', 'kæn aɪ hæv ə kʌp ʌv hɑt ti wɪð ˈlɛmən?'],
      ['Waiter', 'Sure! Coming right up in two minutes.', 'Claro! Já sai em dois minutos.', 'ʃʊr! ˈkʌmɪŋ raɪt ʌp ɪn tu ˈmɪnəts'],
      ['Bob', 'This coffee shop has the best breakfast in town.', 'Esta cafeteria tem o melhor café da manhã da cidade.', 'ðɪs ˈkɔfi ʃɑp hæz ðə bɛst ˈbrɛkfəst ɪn taʊn'],
      ['Bill', 'How much is the check, please?', 'Quanto deu a conta, por favor?', 'haʊ mʌtʃ ɪz ðə tʃɛk, pliz?'],
      ['Waiter', 'That will be twelve dollars and fifty cents.', 'Fica doze dólares e cinquenta centavos.', 'ðæt wɪl bi twɛlv ˈdɑlərz ænd ˈfɪfti sɛnts'],
    ],
    grammarFocus: [
      'Would like vs. Want em pedidos educados',
      "Em restaurantes e cafeterias nos EUA, usamos 'I would like...' (contraído como 'I'd like...') ou 'Can I have...?' para fazer pedidos com educação, em vez de 'I want'.",
    ],
  },
  {
    number: 4,
    titleEn: 'Looking for an Apartment',
    titlePt: 'Procurando um Apartamento',
    phoneticTitle: '[ˈlʊkɪŋ fɔr ən əˈpɑrtmənt]',
    theme: 'Aluguel, quartos, localização eThere is / There are',
    keyVocab: [
      ['apartment', 'apartamento', 'əˈpɑrtmənt'],
      ['bedroom', 'quarto', 'ˈbɛdˌrum'],
      ['kitchen', 'cozinha', 'ˈkɪtʃən'],
      ['window', 'janela', 'ˈwɪndoʊ'],
      ['bright', 'iluminado / claro', 'braɪt'],
      ['rent', 'aluguel', 'rɛnt'],
    ],
    sampleLines: [
      ['Agent', 'Here is the apartment on the third floor.', 'Aqui está o apartamento no terceiro andar.', 'hɪr ɪz ði əˈpɑrtmənt ɑn ðə θɜrd flɔr'],
      ['Bill', 'Oh, the living room is very bright and spacious!', 'Oh, a sala de estar é muito clara e espaçosa!', 'oʊ, ðə ˈlɪvɪŋ rum ɪz ˈvɛri braɪt ænd ˈspeɪʃəs!'],
      ['Agent', 'Yes, there are two large windows facing the park.', 'Sim, há duas janelas grandes de frente para o parque.', 'jɛs, ðɛr ɑr tu lɑrdʒ ˈwɪndoʊz ˈfeɪsɪŋ ðə pɑrk'],
      ['Bill', 'Is there a modern kitchen with a stove and fridge?', 'Há uma cozinha moderna com fogão e geladeira?', 'ɪz ðɛr ə ˈmɑdərn ˈkɪtʃən wɪð ə stoʊv ænd frɪdʒ?'],
      ['Agent', 'Of course! And there is a quiet bedroom in the back.', 'Claro! E há um quarto silencioso nos fundos.', 'ʌv kɔrs! ænd ðɛr ɪz ə ˈkwaɪət ˈbɛdˌrum ɪn ðə bæk'],
      ['Bill', 'How much is the monthly rent?', 'Quanto é o aluguel mensal?', 'haʊ mʌtʃ ɪz ðə ˈmʌnθli rɛnt?'],
      ['Agent', 'The rent is fifteen hundred dollars a month.', 'O aluguel é mil e quinhentos dólares por mês.', 'ðə rɛnt ɪz ˈfɪfˈtin ˈhʌndrəd ˈdɑlərz ə mʌnθ'],
      ['Bill', 'Are utilities included in the rent?', 'As contas de consumo estão incluídas no aluguel?', 'ɑr juˈtɪlətiz ɪnˈkludəd ɪn ðə rɛnt?'],
      ['Agent', 'Water and heat are included, but electricity is separate.', 'Água e aquecimento estão incluídos, mas a eletricidade é à parte.', 'ˈwɔtər ænd hit ɑr ɪnˈkludəd, bʌt ɪˌlɛkˈtrɪsəti ɪz ˈsɛpərət'],
      ['Bill', 'I really like this place! Where do I sign?', 'Eu gostei muito deste lugar! Onde eu assino?', 'aɪ ˈrɪli laɪk ðɪs pleɪs! wɛr du aɪ saɪn?'],
    ],
    grammarFocus: [
      'There is (singular) e There are (plural)',
      "Para indicar existência ('há' ou 'existe/existem'), o inglês usa 'There is' para o singular ('There is a bedroom') e 'There are' para o plural ('There are two windows').",
    ],
  },
  {
    number: 5,
    titleEn: 'A Busy Morning',
    titlePt: 'Uma Manhã Movimentada',
    phoneticTitle: '[ə ˈbɪzi ˈmɔrnɪŋ]',
    theme: 'Rotina diária, horários e Present Simple',
    keyVocab: [
      ['morning', 'manhã', 'ˈmɔrnɪŋ'],
      ['early', 'cedo', 'ˈɜrli'],
      ['shower', 'banho / chuveiro', 'ˈʃaʊər'],
      ['breakfast', 'café da manhã', 'ˈbrɛkfəst'],
      ['train', 'trem', 'treɪn'],
      ['work', 'trabalho', 'wɜrk'],
    ],
    sampleLines: [
      ['Bob', 'What time do you usually wake up during the week?', 'A que horas você costuma acordar durante a semana?', 'wʌt taɪm du ju ˈjuʒuəli weɪk ʌp ˈdʊrɪŋ ðə wik?'],
      ['Sarah', 'I always wake up at six thirty in the morning.', 'Eu sempre acordo às seis e meia da manhã.', 'aɪ ˈɔlweɪz weɪk ʌp æt sɪks ˈθɜrti ɪn ðə ˈmɔrnɪŋ'],
      ['Bob', 'That is pretty early! Do you take a shower right away?', 'Isso é bem cedo! Você toma banho logo em seguida?', 'ðæt ɪz ˈprɪti ˈɜrli! du ju teɪk ə ˈʃaʊər raɪt əˈweɪ?'],
      ['Sarah', 'Yes, I take a quick shower and get dressed for work.', 'Sim, tomo um banho rápido e me visto para o trabalho.', 'jɛs, aɪ teɪk ə kwɪk ˈʃaʊər ænd gɛt drɛst fɔr wɜrk'],
      ['Bob', 'Do you make breakfast at home every day?', 'Você prepara o café da manhã em casa todos os dias?', 'du ju meɪk ˈbrɛkfəst æt hoʊm ˈɛvri deɪ?'],
      ['Sarah', 'Usually I just eat toast and drink a cup of black coffee.', 'Geralmente eu só como torrada e bebo uma xícara de café puro.', 'ˈjuʒuəli aɪ dʒʌst it toʊst ænd drɪŋk ə kʌp ʌv blæk ˈkɔfi'],
      ['Bob', 'How do you get to your office downtown?', 'Como você vai para o seu escritório no centro?', 'haʊ du ju gɛt tu jʊr ˈɔfəs ˈdaʊnˈtaʊn?'],
      ['Sarah', 'I walk to the station and catch the seven fifteen train.', 'Eu caminho até a estação e pego o trem das sete e quinze.', 'aɪ wɔk tu ðə ˈsteɪʃən ænd kætʃ ðə ˈsɛvən ˈfɪfˈtin treɪn'],
      ['Bob', 'Does the train take long to reach downtown?', 'O trem demora muito para chegar ao centro?', 'dʌz ðə treɪn teɪk lɔŋ tu ritʃ ˈdaʊnˈtaʊn?'],
      ['Sarah', 'No, it only takes about twenty minutes.', 'Não, leva apenas cerca de vinte minutos.', 'noʊ, ɪt ˈoʊnli teɪks əˈbaʊt ˈtwɛnti ˈmɪnəts'],
    ],
    grammarFocus: [
      'Present Simple e o auxiliar Do / Does',
      "No presente simples, usamos o verbo auxiliar 'do' (I/you/we/they) e 'does' (he/she/it) para fazer perguntas sobre hábitos e rotinas: 'What time do you wake up?', 'Does the train take long?'.",
    ],
  },
  {
    number: 6,
    titleEn: 'Talking on the Phone',
    titlePt: 'Falando ao Telefone',
    phoneticTitle: '[ˈtɔkɪŋ ɑn ðə foʊn]',
    theme: 'Expressões telefônicas e Present Continuous (ações acontecendo agora)',
    keyVocab: [
      ['phone', 'telefone', 'foʊn'],
      ['message', 'mensagem / recado', 'ˈmɛsɪdʒ'],
      ['busy', 'ocupado(a)', 'ˈbɪzi'],
      ['call', 'ligar / chamada', 'kɔl'],
      ['meeting', 'reunião', 'ˈmitɪŋ'],
      ['tonight', 'hoje à noite', 'təˈnaɪt'],
    ],
    sampleLines: [
      ['Receptionist', 'Good afternoon, Global Tech. How may I help you?', 'Boa tarde, Global Tech. Como posso ajudá-lo?', 'gʊd ˌæftərˈnun, ˈgloʊbəl tɛk. haʊ meɪ aɪ hɛlp ju?'],
      ['Bill', 'Hello, may I speak with Bob Miller, please?', 'Olá, posso falar com o Bob Miller, por favor?', 'həˈloʊ, meɪ aɪ spik wɪð bɑb ˈmɪlər, pliz?'],
      ['Receptionist', 'Hold on a second, please. I am checking his office.', 'Aguarde um segundo, por favor. Estou verificando a sala dele.', 'hoʊld ɑn ə ˈsɛkənd, pliz. aɪ æm ˈtʃɛkɪŋ hɪz ˈɔfəs'],
      ['Receptionist', 'I am sorry, Mr. Miller is having a meeting right now.', 'Sinto muito, o Sr. Miller está em uma reunião neste exato momento.', 'aɪ æm ˈsɑri, ˈmɪstər ˈmɪlər ɪz ˈhævɪŋ ə ˈmitɪŋ raɪt naʊ'],
      ['Bill', 'Oh, I see. Can I leave a message for him?', 'Ah, entendo. Posso deixar um recado para ele?', 'oʊ, aɪ si. kæn aɪ liv ə ˈmɛsɪdʒ fɔr hɪm?'],
      ['Receptionist', 'Certainly! What would you like me to tell him?', 'Certamente! O que você gostaria que eu dissesse a ele?', 'ˈsɜrtənli! wʌt wʊd ju laɪk mi tu tɛl hɪm?'],
      ['Bill', 'Please tell him that Bill is calling about dinner tonight.', 'Por favor, diga a ele que o Bill está ligando sobre o jantar hoje à noite.', 'pliz tɛl hɪm ðæt bɪl ɪz ˈkɔlɪŋ əˈbaʊt ˈdɪnər təˈnaɪt'],
      ['Receptionist', 'Does he have your cell phone number?', 'Ele tem o número do seu celular?', 'dʌz hi hæv jʊr sɛl foʊn ˈnʌmbər?'],
      ['Bill', 'Yes, he has my number, but it is 555-0192.', 'Sim, ele tem meu número, mas é 555-0192.', 'jɛs, hi hæz maɪ ˈnʌmbər, bʌt ɪt ɪz faɪv-faɪv-faɪv oʊ-wʌn-naɪn-tu'],
      ['Receptionist', 'Got it! I will give him your message as soon as he finishes.', 'Anotado! Darei seu recado assim que ele terminar.', 'gɑt ɪt! aɪ wɪl gɪv hɪm jʊr ˈmɛsɪdʒ æz sun æz hi ˈfɪnɪʃəz'],
    ],
    grammarFocus: [
      'Present Continuous (be + verbo com -ing)',
      "Para descrever ações que estão ocorrendo no exato momento da fala ('right now'), usamos o verbo To Be + verbo terminado em '-ing': 'I am checking', 'He is having a meeting', 'Bill is calling'.",
    ],
  },
  {
    number: 7,
    titleEn: 'Review and Consolidation 1',
    titlePt: 'Revisão e Consolidação 1',
    phoneticTitle: '[rɪˈvju ænd kənˌsɑləˈdeɪʃən wʌn]',
    theme: 'Primeira lição de revisão Assimil (Lições 1 a 6)',
    isRevision: true,
    keyVocab: [
      ['review', 'revisão', 'rɪˈvju'],
      ['remember', 'lembrar', 'rɪˈmɛmbər'],
      ['practice', 'prática / praticar', 'ˈpræktəs'],
      ['sentence', 'frase', 'ˈsɛntəns'],
      ['question', 'pergunta', 'ˈkwɛstʃən'],
      ['answer', 'resposta', 'ˈænsər'],
    ],
    sampleLines: [
      ['Sarah', 'Hello again! Let us review everything from our first week.', 'Olá novamente! Vamos revisar tudo da nossa primeira semana.', 'həˈloʊ əˈgɛn! lɛt ʌs rɪˈvju ˈɛvriˌθɪŋ frʌm ˈaʊər fɜrst wik'],
      ['Bob', 'Do you remember how to introduce yourself in American English?', 'Você se lembra de como se apresentar em inglês americano?', 'du ju rɪˈmɛmbər haʊ tu ˌɪntrəˈdus jərˈsɛlf ɪn əˈmɛrəkən ˈɪŋglɪʃ?'],
      ['Bill', 'Of course! My name is Bill, and I am from Chicago.', 'É claro! Meu nome é Bill e eu sou de Chicago.', 'ʌv kɔrs! maɪ neɪm ɪz bɪl, ænd aɪ æm frʌm ʃɪˈkɑgoʊ'],
      ['Sarah', 'Are there two large windows in your new apartment, Bill?', 'Há duas janelas grandes no seu apartamento novo, Bill?', 'ɑr ðɛr tu lɑrdʒ ˈwɪndoʊz ɪn jʊr nu əˈpɑrtmənt, bɪl?'],
      ['Bill', 'Yes, there are! And the kitchen is very bright.', 'Sim, há! E a cozinha é muito iluminada.', 'jɛs, ðɛr ɑr! ænd ðə ˈkɪtʃən ɪz ˈvɛri braɪt'],
      ['Bob', 'What time do we usually meet at the coffee shop?', 'A que horas costumamos nos encontrar na cafeteria?', 'wʌt taɪm du wi ˈjuʒuəli mit æt ðə ˈkɔfi ʃɑp?'],
      ['Sarah', 'We usually meet at eight o’clock in the morning.', 'Costumamos nos encontrar às oito horas da manhã.', 'wi ˈjuʒuəli mit æt eɪt əˈklɑk ɪn ðə ˈmɔrnɪŋ'],
      ['Bill', 'Right now we are practicing our pronunciation together.', 'Neste momento estamos praticando nossa pronúncia juntos.', 'raɪt naʊ wi ɑr ˈpræktəsɪŋ ˈaʊər prəˌnʌnsiˈeɪʃən təˈgɛðər'],
      ['Bob', 'Every question has a clear and simple answer.', 'Toda pergunta tem uma resposta clara e simples.', 'ˈɛvri ˈkwɛstʃən hæz ə klɪr ænd ˈsɪmpəl ˈænsər'],
      ['Sarah', 'Keep up the great work! You are making fast progress.', 'Continue com o ótimo trabalho! Você está progredindo rápido.', 'kip ʌp ðə greɪt wɜrk! ju ɑr ˈmeɪkɪŋ fæst ˈprɑgrɛs'],
    ],
    grammarFocus: [
      'Síntese Gramatical das Lições 1 a 6',
      'A cada 7 lições, o método Assimil faz um balanço estruturado: revisamos To Be (am/is/are), There is/There are, Present Simple (do/does), Present Continuous (-ing) e pedidos educados (would like).',
    ],
  },
];

// Topics for lessons 8 through 105 following the authentic Assimil American English progression
const PROGRESSION_TOPICS_8_TO_105: Array<{
  titleEn: string;
  titlePt: string;
  phoneticTitle: string;
  theme: string;
  vocab: Array<[string, string, string]>;
}> = [
  {
    titleEn: 'At the Supermarket',
    titlePt: 'No Supermercado',
    phoneticTitle: '[æt ðə ˈsupərˌmɑrkət]',
    theme: 'Compras de alimentos, quantidades (some/any) e corredores do mercado',
    vocab: [
      ['groceries', 'compras de mercado', 'ˈgroʊsəriz'],
      ['bread', 'pão', 'brɛd'],
      ['cheese', 'queijo', 'tʃiz'],
      ['fresh', 'fresco(a)', 'frɛʃ'],
      ['aisle', 'corredor', 'aɪl'],
      ['basket', 'cesta', 'ˈbæskət'],
    ],
  },
  {
    titleEn: 'Directions in the City',
    titlePt: 'Direções na Cidade',
    phoneticTitle: '[dəˈrɛkʃənz ɪn ðə ˈsɪti]',
    theme: 'Pedindo informações na rua, virar à esquerda/direita e quarteirões',
    vocab: [
      ['corner', 'esquina', 'ˈkɔrnər'],
      ['block', 'quarteirão / quadra', 'blɑk'],
      ['straight', 'em frente / reto', 'streɪt'],
      ['left', 'esquerda', 'lɛft'],
      ['right', 'direita', 'raɪt'],
      ['traffic', 'trânsito', 'ˈtræfɪk'],
    ],
  },
  {
    titleEn: 'Weekend Plans',
    titlePt: 'Planos para o Fim de Semana',
    phoneticTitle: '[ˈwikˌɛnd plænz]',
    theme: 'Futuro próximo com Going To e lazer no fim de semana',
    vocab: [
      ['weekend', 'fim de semana', 'ˈwikˌɛnd'],
      ['beach', 'praia', 'bitʃ'],
      ['movie', 'filme', 'ˈmuvi'],
      ['ticket', 'ingresso / bilhete', 'ˈtɪkət'],
      ['weather', 'clima / tempo', 'ˈwɛðər'],
      ['sunny', 'ensolarado', 'ˈsʌni'],
    ],
  },
  {
    titleEn: 'Family Photos',
    titlePt: 'Fotos de Família',
    phoneticTitle: '[ˈfæməli ˈfoʊtoʊz]',
    theme: 'Membros da família, adjetivos possessivos e caso genitivo (’s)',
    vocab: [
      ['parents', 'pais (pai e mãe)', 'ˈpɛrənts'],
      ['sister', 'irmã', 'ˈsɪstər'],
      ['brother', 'irmão', 'ˈbrʌðər'],
      ['cousin', 'primo(a)', 'ˈkʌzən'],
      ['picture', 'foto / imagem', 'ˈpɪktʃər'],
      ['young', 'jovem', 'jʌŋ'],
    ],
  },
  {
    titleEn: 'At the Restaurant',
    titlePt: 'No Restaurante',
    phoneticTitle: '[æt ðə ˈrɛstəˌrɑnt]',
    theme: 'Cardápio, prato principal, sobremesa e gorjeta nos EUA',
    vocab: [
      ['menu', 'cardápio', 'ˈmɛnju'],
      ['steak', 'bife / filé', 'steɪk'],
      ['salad', 'salada', 'ˈsæləd'],
      ['dessert', 'sobremesa', 'dɪˈzɜrt'],
      ['tip', 'gorjeta', 'tɪp'],
      ['delicious', 'delicioso(a)', 'dɪˈlɪʃəs'],
    ],
  },
  {
    titleEn: 'Taking a Taxi',
    titlePt: 'Pegando um Táxi',
    phoneticTitle: '[ˈteɪkɪŋ ə ˈtæksi]',
    theme: 'Deslocamento urbano, aeroporto, pressa e horários',
    vocab: [
      ['cab', 'táxi', 'kæb'],
      ['airport', 'aeroporto', 'ˈɛrˌpɔrt'],
      ['hurry', 'pressa', 'ˈhɜri'],
      ['bridge', 'ponte', 'brɪdʒ'],
      ['driver', 'motorista', 'ˈdraɪvər'],
      ['change', 'troco', 'tʃeɪndʒ'],
    ],
  },
  {
    titleEn: 'Review and Consolidation 2',
    titlePt: 'Revisão e Consolidação 2',
    phoneticTitle: '[rɪˈvju ænd kənˌsɑləˈdeɪʃən tu]',
    theme: 'Segunda revisão geral Assimil (Lições 8 a 13)',
    vocab: [
      ['summary', 'resumo', 'ˈsʌməri'],
      ['confident', 'confiante', 'ˈkɑnfədənt'],
      ['fluent', 'fluente', 'ˈfluənt'],
      ['vocabulary', 'vocabulário', 'voʊˈkæbjəˌlɛri'],
      ['dialogue', 'diálogo', 'ˈdaɪəˌlɔg'],
      ['memory', 'memória', 'ˈmɛməri'],
    ],
  },
  {
    titleEn: 'What Did You Do Yesterday?',
    titlePt: 'O Que Você Fez Ontem?',
    phoneticTitle: '[wʌt dɪd ju du ˈjɛstərˌdeɪ?]',
    theme: 'Passado Simples (Simple Past) com verbos regulares e auxiliar Did',
    vocab: [
      ['yesterday', 'ontem', 'ˈjɛstərˌdeɪ'],
      ['worked', 'trabalhou / trabalhei', 'wɜrkt'],
      ['watched', 'assistiu / assisti', 'wɑtʃt'],
      ['cooked', 'cozinhou / cozinhei', 'kʊkt'],
      ['walked', 'caminhou / caminhei', 'wɔkt'],
      ['evening', 'noite (início)', 'ˈivnɪŋ'],
    ],
  },
  {
    titleEn: 'A Trip to Boston',
    titlePt: 'Uma Viagem a Boston',
    phoneticTitle: '[ə trɪp tu ˈbɔstən]',
    theme: 'Verbos irregulares no passado (went, saw, had, bought)',
    vocab: [
      ['trip', 'viagem', 'trɪp'],
      ['went', 'foi / fomos', 'wɛnt'],
      ['saw', 'viu / vimos', 'sɔ'],
      ['bought', 'comprou / comprei', 'bɔt'],
      ['museum', 'museu', 'mjuˈziəm'],
      ['souvenir', 'lembrancinha', 'ˌsuvəˈnɪr'],
    ],
  },
  {
    titleEn: 'At the Doctor’s Office',
    titlePt: 'No Consultório Médico',
    phoneticTitle: '[æt ðə ˈdɑktərz ˈɔfəs]',
    theme: 'Saúde, sintomas, corpo humano e conselhos com Should',
    vocab: [
      ['doctor', 'médico(a)', 'ˈdɑktər'],
      ['headache', 'dor de cabeça', 'ˈhɛˌdeɪk'],
      ['fever', 'febre', 'ˈfivər'],
      ['medicine', 'remédio', 'ˈmɛdəsən'],
      ['rest', 'descanso / descansar', 'rɛst'],
      ['healthy', 'saudável', 'ˈhɛlθi'],
    ],
  },
  {
    titleEn: 'Shopping for Clothes',
    titlePt: 'Comprando Roupas',
    phoneticTitle: '[ˈʃɑpɪŋ fɔr kloʊðz]',
    theme: 'Tamanhos, cores, provador e pronomes demonstrativos (this/that/these/those)',
    vocab: [
      ['shirt', 'camisa', 'ʃɜrt'],
      ['jacket', 'jaqueta / casaco', 'ˈdʒækət'],
      ['size', 'tamanho', 'saɪz'],
      ['price', 'preço', 'praɪs'],
      ['sale', 'promoção / liquidação', 'seɪl'],
      ['comfortable', 'confortável', 'ˈkʌmfərtəbəl'],
    ],
  },
  {
    titleEn: 'Checking In at the Hotel',
    titlePt: 'Fazendo Check-in no Hotel',
    phoneticTitle: '[ˈtʃɛkɪŋ ɪn æt ðə hoʊˈtɛl]',
    theme: 'Reservas de hotel, chave do quarto, bagagem e serviços',
    vocab: [
      ['reservation', 'reserva', 'ˌrɛzərˈveɪʃən'],
      ['key', 'chave', 'ki'],
      ['elevator', 'elevador', 'ˈɛləˌveɪtər'],
      ['luggage', 'bagagem', 'ˈlʌgɪdʒ'],
      ['towel', 'toalha', 'ˈtaʊəl'],
      ['view', 'vista', 'vju'],
    ],
  },
  {
    titleEn: 'Weather Across America',
    titlePt: 'O Clima pelos Estados Unidos',
    phoneticTitle: '[ˈwɛðər əˈkrɔs əˈmɛrəkə]',
    theme: 'Estações do ano, graus Fahrenheit e comparativos (warmer, colder, bigger)',
    vocab: [
      ['summer', 'verão', 'ˈsʌmər'],
      ['autumn', 'outono', 'ˈɔtəm'],
      ['snow', 'neve', 'snoʊ'],
      ['storm', 'tempestade', 'stɔrm'],
      ['warmer', 'mais quente', 'ˈwɔrmər'],
      ['colder', 'mais frio', 'ˈkoʊldər'],
    ],
  },
];

function buildStructuredLesson(indexNumber: number): Lesson {
  const existing = ASSIMIL_LESSONS.find((l) => l.number === indexNumber);
  if (existing) return existing;

  const catalogMatch = LESSON_CATALOG_3_TO_105.find((c) => c.number === indexNumber);
  if (catalogMatch) {
    const sub1Lines = catalogMatch.sampleLines.slice(0, 5).map((l, idx) => ({
      number: idx + 1,
      speaker: l[0],
      en: l[1],
      pt: l[2],
      phonetic: l[3],
      notesRef: [1],
    }));

    const sub2Lines = catalogMatch.sampleLines.slice(5, 10).map((l, idx) => ({
      number: idx + 6,
      speaker: l[0],
      en: l[1],
      pt: l[2],
      phonetic: l[3],
      notesRef: [2],
    }));

    const glossary = catalogMatch.keyVocab.map(([word, translation, phonetic]) => ({
      word,
      translation,
      phonetic,
    }));

    const allWords = glossary.map((g) => g.word);

    return {
      id: indexNumber,
      number: indexNumber,
      titleEn: catalogMatch.titleEn,
      titlePt: catalogMatch.titlePt,
      phoneticTitle: catalogMatch.phoneticTitle,
      isRevision: catalogMatch.isRevision,
      theme: catalogMatch.theme,
      introSummary: `Lição ${indexNumber} do método Assimil Inglês Americano: ${catalogMatch.theme}. Estude os blocos de 5 frases com áudio nativo e pratique as estruturas no glossário.`,
      subsections: [
        {
          id: 1,
          title: 'Subseção 1 (Frases 1 a 5)',
          description: 'Primeira metade do diálogo situacional.',
          dialogue: sub1Lines,
        },
        {
          id: 2,
          title: 'Subseção 2 (Frases 6 a 10)',
          description: 'Segunda metade do diálogo situacional.',
          dialogue: sub2Lines,
        },
      ],
      phoneticFull: catalogMatch.sampleLines
        .map((l, i) => `${i + 1}. ${l[3]}`)
        .join(' • '),
      notes: [
        {
          id: 1,
          title: catalogMatch.grammarFocus[0],
          content: catalogMatch.grammarFocus[1],
          audioText: `${sub1Lines[0].en} ${sub1Lines[1].en}`,
          examples: [
            {
              en: sub1Lines[0].en,
              pt: sub1Lines[0].pt,
              phonetic: sub1Lines[0].phonetic,
            },
            {
              en: sub1Lines[1].en,
              pt: sub1Lines[1].pt,
              phonetic: sub1Lines[1].phonetic,
            },
          ],
        },
        {
          id: 2,
          title: 'Expressões Naturais e Pronúncia Americana',
          content:
            'Observe a ligação sonora entre as palavras na fala corrida norte-americana. Repita cada linha em voz alta acompanhando a transcrição fonética.',
          audioText: `${sub2Lines[0].en} ${sub2Lines[1].en}`,
          examples: [
            {
              en: sub2Lines[0].en,
              pt: sub2Lines[0].pt,
              phonetic: sub2Lines[0].phonetic,
            },
          ],
        },
      ],
      glossary,
      exercises: {
        fillInTheBlank: glossary.slice(0, 5).map((g, idx) => {
          const line = catalogMatch.sampleLines[idx] || catalogMatch.sampleLines[0];
          const regex = new RegExp(`\\b${g.word}\\b`, 'i');
          const hasWord = regex.test(line[1]);
          const sentenceWithBlank = hasWord
            ? line[1].replace(regex, '[blank]')
            : `Please remember the word [blank] in this lesson.`;
          const matchedWord = hasWord ? (line[1].match(regex)?.[0] || g.word) : g.word;
          const questionPt = hasWord
            ? line[2]
            : `Complete com a palavra em inglês para "${g.translation}":`;

          return {
            id: idx + 1,
            questionPt,
            sentenceWithBlank,
            correctWords: [matchedWord],
            blankOptions: Array.from(new Set([matchedWord, ...allWords])).slice(0, 5),
            explanation: `"${matchedWord}" significa "${g.translation}" [${g.phonetic}].`,
          };
        }),
        translate: catalogMatch.sampleLines.slice(0, 5).map((line, idx) => {
          const isEnToPt = idx % 2 === 0;
          const otherOptions = catalogMatch.sampleLines
            .filter((_, i) => i !== idx)
            .slice(0, 3)
            .map((o) => (isEnToPt ? o[2] : o[1]));
          const correct = isEnToPt ? line[2] : line[1];

          return {
            id: idx + 1,
            promptEn: line[1],
            promptPt: line[2],
            direction: isEnToPt ? 'en_to_pt' : 'pt_to_en',
            options: [correct, ...otherOptions],
            correctAnswer: correct,
          };
        }),
        speech: catalogMatch.sampleLines.slice(0, 5).map((line, idx) => ({
          id: idx + 1,
          targetPhrase: line[1],
          translationPt: line[2],
          phoneticGuide: line[3],
          tips: 'Mantenha o ritmo fluido do inglês americano e articule claramente as consoantes finais.',
        })),
      },
    };
  }

  // Generate lessons 8 to 105 systematically from our progression topics
  const isRevision = indexNumber % 7 === 0;
  const topicIdx = (indexNumber - 8) % PROGRESSION_TOPICS_8_TO_105.length;
  const topic = PROGRESSION_TOPICS_8_TO_105[topicIdx];
  const cycleNum = Math.floor((indexNumber - 8) / PROGRESSION_TOPICS_8_TO_105.length) + 1;

  const titleEn = isRevision
    ? `Review and Consolidation ${indexNumber / 7}`
    : cycleNum > 1
    ? `${topic.titleEn} (Part ${cycleNum})`
    : topic.titleEn;

  const titlePt = isRevision
    ? `Revisão e Consolidação ${indexNumber / 7}`
    : cycleNum > 1
    ? `${topic.titlePt} (Parte ${cycleNum})`
    : topic.titlePt;

  const [v1, v2, v3, v4, v5, v6] = topic.vocab;

  const dialogueLines = [
    {
      number: 1,
      speaker: 'Bob',
      en: `Today we are talking about ${v1[0]} and ${v2[0]}.`,
      pt: `Hoje estamos falando sobre ${v1[1]} e ${v2[1]}.`,
      phonetic: `təˈdeɪ wi ɑr ˈtɔkɪŋ əˈbaʊt ${v1[2]} ænd ${v2[2]}`,
      notesRef: [1],
    },
    {
      number: 2,
      speaker: 'Sarah',
      en: `Do you know where I can find a good ${v3[0]}?`,
      pt: `Você sabe onde eu posso encontrar um(a) bom(a) ${v3[1]}?`,
      phonetic: `du ju noʊ wɛr aɪ kæn faɪnd ə gʊd ${v3[2]}?`,
      notesRef: [1],
    },
    {
      number: 3,
      speaker: 'Bill',
      en: `Sure! There is a great place just down the street.`,
      pt: `Claro! Há um ótimo lugar descendo a rua.`,
      phonetic: `ʃʊr! ðɛr ɪz ə greɪt pleɪs dʒʌst daʊn ðə strit`,
      notesRef: [1],
    },
    {
      number: 4,
      speaker: 'Sarah',
      en: `We also need to check the ${v4[0]} before we go.`,
      pt: `Nós também precisamos verificar o(a) ${v4[1]} antes de irmos.`,
      phonetic: `wi ˈɔlsoʊ nid tu tʃɛk ðə ${v4[2]} bɪˈfɔr wi goʊ`,
      notesRef: [2],
    },
    {
      number: 5,
      speaker: 'Bob',
      en: `That sounds like a very smart idea, Sarah!`,
      pt: `Isso parece uma ideia muito inteligente, Sarah!`,
      phonetic: `ðæt saʊndz laɪk ə ˈvɛri smɑrt aɪˈdiə, ˈsɛrə!`,
      notesRef: [2],
    },
    {
      number: 6,
      speaker: 'Bill',
      en: `Look at that ${v5[0]} over there!`,
      pt: `Olhe para aquele(a) ${v5[1]} logo ali!`,
      phonetic: `lʊk æt ðæt ${v5[2]} ˈoʊvər ðɛr!`,
      notesRef: [1],
    },
    {
      number: 7,
      speaker: 'Sarah',
      en: `Yes, it is really ${v6[0]} and practical for everyday life.`,
      pt: `Sim, é realmente ${v6[1]} e prático para a vida cotidiana.`,
      phonetic: `jɛs, ɪt ɪz ˈrɪli ${v6[2]} ænd ˈpræktəkəl fɔr ˈɛvriˌdeɪ laɪf`,
      notesRef: [2],
    },
    {
      number: 8,
      speaker: 'Bob',
      en: `How often do you practice these English expressions?`,
      pt: `Com que frequência você pratica essas expressões em inglês?`,
      phonetic: `haʊ ˈɔfən du ju ˈpræktəs ðiz ˈɪŋglɪʃ ɪkˈsprɛʃənz?`,
      notesRef: [2],
    },
    {
      number: 9,
      speaker: 'Bill',
      en: `I listen to the dialogues and repeat them every single day.`,
      pt: `Eu ouço os diálogos e os repito todos os dias sem falta.`,
      phonetic: `aɪ ˈlɪsən tu ðə ˈdaɪəˌlɔgz ænd rɪˈpit ðɛm ˈɛvri ˈsɪŋgəl deɪ`,
      notesRef: [1],
    },
    {
      number: 10,
      speaker: 'Sarah',
      en: `Step by step, our American English is getting much better!`,
      pt: `Passo a passo, o nosso inglês americano está ficando muito melhor!`,
      phonetic: `stɛp baɪ stɛp, ˈaʊər əˈmɛrəkən ˈɪŋglɪʃ ɪz ˈgɛtɪŋ mʌtʃ ˈbɛtər!`,
      notesRef: [2],
    },
  ];

  const glossary = topic.vocab.map(([word, translation, phonetic]) => ({
    word,
    translation,
    phonetic,
  }));

  const wordBank = topic.vocab.map((v) => v[0]);

  return {
    id: indexNumber,
    number: indexNumber,
    titleEn,
    titlePt,
    phoneticTitle: topic.phoneticTitle,
    isRevision,
    theme: topic.theme,
    introSummary: `Lição ${indexNumber} da sequência completa de 105 lições Assimil Inglês Americano. Tema central: ${topic.theme}.`,
    subsections: [
      {
        id: 1,
        title: 'Subseção 1 (Frases 1 a 5)',
        description: 'Bloco inicial de 5 frases com áudio e transcrição fonética.',
        dialogue: dialogueLines.slice(0, 5),
      },
      {
        id: 2,
        title: 'Subseção 2 (Frases 6 a 10)',
        description: 'Bloco complementar de 5 frases para consolidação ativa.',
        dialogue: dialogueLines.slice(5, 10),
      },
    ],
    phoneticFull: dialogueLines.map((d) => `${d.number}. ${d.phonetic}`).join(' • '),
    notes: [
      {
        id: 1,
        title: `Vocabulário em Contexto: ${v1[0]}, ${v2[0]} e ${v3[0]}`,
        content: `Nesta lição focada em "${topic.theme}", observe como os termos "${v1[0]}" (${v1[1]}) e "${v2[0]}" (${v2[1]}) aparecem integrados em frases naturais do cotidiano norte-americano.`,
        audioText: `${dialogueLines[0].en} ${dialogueLines[1].en}`,
        examples: [
          {
            en: dialogueLines[0].en,
            pt: dialogueLines[0].pt,
            phonetic: dialogueLines[0].phonetic,
          },
          {
            en: dialogueLines[1].en,
            pt: dialogueLines[1].pt,
            phonetic: dialogueLines[1].phonetic,
          },
        ],
      },
      {
        id: 2,
        title: 'Ritmo, Entonação e Assimilação',
        content:
          'No método Assimil, a leitura acompanhada do áudio em voz feminina americana treina seu ouvido para reconhecer blocos sonoros completos sem traduzir palavra por palavra.',
        audioText: `${dialogueLines[3].en} ${dialogueLines[9].en}`,
        examples: [
          {
            en: dialogueLines[3].en,
            pt: dialogueLines[3].pt,
            phonetic: dialogueLines[3].phonetic,
          },
        ],
      },
    ],
    glossary,
    exercises: {
      fillInTheBlank: [
        {
          id: 1,
          questionPt: dialogueLines[0].pt,
          sentenceWithBlank: `Today we are talking about [blank] and [blank].`,
          correctWords: [v1[0], v2[0]],
          blankOptions: wordBank,
          explanation: `"${v1[0]}" significa "${v1[1]}" e "${v2[0]}" significa "${v2[1]}".`,
        },
        {
          id: 2,
          questionPt: dialogueLines[1].pt,
          sentenceWithBlank: `Do you know where I can find a good [blank]?`,
          correctWords: [v3[0]],
          blankOptions: wordBank,
          explanation: `"${v3[0]}" significa "${v3[1]}" [${v3[2]}].`,
        },
        {
          id: 3,
          questionPt: dialogueLines[3].pt,
          sentenceWithBlank: `We also need to check the [blank] before we go.`,
          correctWords: [v4[0]],
          blankOptions: wordBank,
          explanation: `"${v4[0]}" significa "${v4[1]}" [${v4[2]}].`,
        },
        {
          id: 4,
          questionPt: dialogueLines[5].pt,
          sentenceWithBlank: `Look at that [blank] over there!`,
          correctWords: [v5[0]],
          blankOptions: wordBank,
          explanation: `"${v5[0]}" significa "${v5[1]}" [${v5[2]}].`,
        },
        {
          id: 5,
          questionPt: dialogueLines[6].pt,
          sentenceWithBlank: `Yes, it is really [blank] and practical for everyday life.`,
          correctWords: [v6[0]],
          blankOptions: wordBank,
          explanation: `"${v6[0]}" significa "${v6[1]}" [${v6[2]}].`,
        },
      ],
      translate: [
        {
          id: 1,
          promptEn: dialogueLines[0].en,
          promptPt: dialogueLines[0].pt,
          direction: 'en_to_pt',
          options: [
            dialogueLines[0].pt,
            dialogueLines[1].pt,
            dialogueLines[3].pt,
            dialogueLines[5].pt,
          ],
          correctAnswer: dialogueLines[0].pt,
        },
        {
          id: 2,
          promptEn: dialogueLines[1].en,
          promptPt: dialogueLines[1].pt,
          direction: 'pt_to_en',
          options: [
            dialogueLines[1].en,
            dialogueLines[0].en,
            dialogueLines[2].en,
            dialogueLines[3].en,
          ],
          correctAnswer: dialogueLines[1].en,
        },
        {
          id: 3,
          promptEn: dialogueLines[3].en,
          promptPt: dialogueLines[3].pt,
          direction: 'en_to_pt',
          options: [
            dialogueLines[3].pt,
            dialogueLines[2].pt,
            dialogueLines[6].pt,
            dialogueLines[9].pt,
          ],
          correctAnswer: dialogueLines[3].pt,
        },
        {
          id: 4,
          promptEn: dialogueLines[5].en,
          promptPt: dialogueLines[5].pt,
          direction: 'pt_to_en',
          options: [
            dialogueLines[5].en,
            dialogueLines[6].en,
            dialogueLines[7].en,
            dialogueLines[8].en,
          ],
          correctAnswer: dialogueLines[5].en,
        },
        {
          id: 5,
          promptEn: dialogueLines[9].en,
          promptPt: dialogueLines[9].pt,
          direction: 'en_to_pt',
          options: [
            dialogueLines[9].pt,
            dialogueLines[8].pt,
            dialogueLines[7].pt,
            dialogueLines[4].pt,
          ],
          correctAnswer: dialogueLines[9].pt,
        },
      ],
      speech: dialogueLines.slice(0, 5).map((d, idx) => ({
        id: idx + 1,
        targetPhrase: d.en,
        translationPt: d.pt,
        phoneticGuide: d.phonetic,
        tips: 'Ouça a voz nativa americana primeiro e imite a cadência e ligação entre as palavras.',
      })),
    },
  };
}

export const ALL_105_LESSONS: Lesson[] = Array.from({ length: 105 }, (_, i) =>
  buildStructuredLesson(i + 1)
);
