const fs = require('fs');

const filePath = 'c:/Users/lxaks/OneDrive/Desktop/education/Smart-LMS/frontend/src/app/components/tutor/AITutor.tsx';
let content = fs.readFileSync(filePath, 'utf8');

const greetingsStart = content.indexOf('const LANGUAGE_GREETINGS');
const greetingsEnd = content.indexOf('};', greetingsStart);

const cleanGreetings = `const LANGUAGE_GREETINGS: Record<string, string> = {
  "Auto-Detect": defaultWelcome,
  "English": defaultWelcome,
  "Hindi": "नमस्ते! मैं आपका एआई मेंटर हूं। आज आप क्या पढ़ना चाहेंगे?",
  "Hinglish": "Hello! I am your AI Mentor. Let me know what you would like to study today in Hinglish!",
  "Spanish": "¡Hola! Soy tu mentor de IA. ¿Qué te gustaría estudiar hoy?",
  "French": "Bonjour ! Je suis votre mentor IA. Qu'aimeriez-vous étudier aujourd'hui ?",
  "German": "Hallo! Ich bin dein KI-Mentor. Was möchtest du heute lernen?",
  "Gujarati": "નમસ્તે! હું તમારો AI મેન્ટર છું. આજે તમે શું ભણવા માંગો છો?",
  "Marathi": "नमस्कार! मी तुमचा एआय मेंटर आहे. आज तुम्हाला काय अभ्यास करायचा आहे?",
  "Bengali": "হ্যালো! আমি আপনার এআই মেন্টর। আজ আপনি কি পড়তে চান?",
  "Tamil": "வணக்கம்! நான் உங்கள் AI வழிகாட்டி. இன்று நீங்கள் என்ன படிக்க விரும்புகிறீர்கள்?",
  "Telugu": "నమస్తే! నేను మీ AI మెంటర్. ఈరోజు మీరు ఏమి చదువుకోవాలనుకుంటున్నారు?",
};`;

if (greetingsStart !== -1 && greetingsEnd !== -1) {
  content = content.slice(0, greetingsStart) + cleanGreetings + content.slice(greetingsEnd + 2);
}

fs.writeFileSync(filePath, content, 'utf8');
console.log("LANGUAGE_GREETINGS fully repaired!");
