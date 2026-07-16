import Groq from "groq-sdk";

/**
 * Cliente Groq para chamadas à API de inferência.
 * Usado apenas no lado do servidor (nunca expor a chave no browser).
 */
export const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

/**
 * Modelo padrão usado para gerar planos de aula.
 * Llama 3.3 70B — excelente qualidade em português e rápido no Groq.
 */
export const GROQ_MODEL = "llama-3.3-70b-versatile";
