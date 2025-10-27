import './style.css'
import { createOpenRouter } from '@openrouter/ai-sdk-provider'
import { generateText, streamText } from 'ai'


const openrouter = createOpenRouter({
  apiKey: import.meta.env.VITE_OPENROUTER_API_KEY
})

console.log(import.meta.env.VITE_OPENROUTER_API_KEY)


const app = document.querySelector('#app')
const form = document.querySelector('#form');
const Submitbtn = document.querySelector('#submit');
const input = document.querySelector('#prompt');
const spinner = document.querySelector('#spinner');
const sendSvg = document.querySelector('#send-svg');
const example1 = document.querySelector('#example-1');
const example2 = document.querySelector('#example-2');

// Quick example buttons
if(example1) example1.addEventListener('click', ()=>{ input.value = 'Explícame la diferencia entre IA y ML en 2 frases'; input.focus(); });
if(example2) example2.addEventListener('click', ()=>{ input.value = 'Dame 5 ideas para un post sobre IA aplicadas a marketing'; input.focus(); });

form.addEventListener('submit', async e=>{
  e.preventDefault()
  const prompt = input.value || '';
  if(prompt.trim() === ''){
    // mejor usar aria-live message o un pequeño aviso visual
    alert('La consulta no puede ir vacía');
    input.focus();
    return
  }

  // Mostrar estado de envío
  Submitbtn.disabled = true;
  input.disabled = true;
  if(spinner && sendSvg){ spinner.classList.remove('hidden'); sendSvg.classList.add('hidden'); }

  try{
    const result = streamText({
      model: openrouter('google/gemini-2.0-flash-exp:free'),
      // model: openrouter('google/gemma-3n-e4b-it:free'),
      // model: openrouter('deepseek/deepseek-prover-v2:free'),
      // model: openrouter('meta-llama/llama-3.3-70b-instruct:free'),
      // model: openrouter('google/gemma-3n-e2b-it:free'),
      prompt: prompt,
    })

    // limpiar contenido previo
    while(app.firstChild){ app.removeChild(app.firstChild) }

    const p = document.createElement('div'); // contenedor del mensaje
    p.className = 'chat-bubble fade-in text-lg';
    p.textContent = '';
    app.appendChild(p);

    // ir agregando texto desde el stream  como si fuera un chat en vivo
    for await (const chunk of result.textStream){
      // chunk puede venir en partes; concatenamos
      p.textContent += chunk;
      // opcional: mantener scroll en fondo en caso de muchos mensajes
      p.scrollIntoView({behavior: 'smooth', block: 'end'});
    }

  }catch(err){
    console.error(err);
    const errNode = document.createElement('div');
    errNode.className = 'text-red-400';
    errNode.textContent = 'Ocurrió un error al generar la respuesta.';
    app.appendChild(errNode);
  }finally{
    Submitbtn.disabled = false;
    input.disabled = false;
    if(spinner && sendSvg){ spinner.classList.add('hidden'); sendSvg.classList.remove('hidden'); }
    input.focus();
  }

});
