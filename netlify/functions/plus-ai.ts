import type { HandlerEvent } from "@netlify/functions";
import { getStore } from "@netlify/blobs";
import { bearerTokenFromHeaders, corsHeaders, json, normalizeDeviceId, verifyPlusToken } from "./_shared/plus";

type Usage = { count: number; updatedAt: string };
type UsageStore = ReturnType<typeof getStore>;

function compactContext(value: unknown) {
  const text = JSON.stringify(value || {});
  return text.slice(0, 6000);
}

function fallbackRecommendation(feature: string, body: any, language: string) {
  const en = language === "English";
  if (feature === "nutrition_plan") {
    const goal = String(body.answers?.goal || "").replace(/_/g, " ");
    const style = String(body.answers?.style || "simple");
    const avoid = String(body.answers?.restriction || body.answers?.avoid || "").trim();
    return {
      title: en ? `7-day ${style} Plus menu` : `Menú Plus ${style} de 7 días`,
      weeklyPlan: en
        ? `Monday: breakfast yogurt with oats and fruit; lunch chicken rice bowl with vegetables; dinner omelette with salad; snack fruit or yogurt.\nTuesday: breakfast eggs and toast; lunch lentils with vegetables; dinner tuna potato salad; snack nuts.\nWednesday: breakfast smoothie with oats; lunch chicken wrap; dinner tofu or eggs with rice; snack fruit.\nThursday: breakfast yogurt bowl; lunch chickpea salad; dinner turkey or tofu with vegetables; snack yogurt.\nFriday: breakfast eggs and fruit; lunch pasta with tuna or lentils; dinner protein salad; snack nuts.\nSaturday: breakfast toast with eggs; lunch rice bowl; dinner easy homemade pizza with protein; snack fruit.\nSunday: breakfast yogurt and oats; lunch roast tray or legumes; dinner light eggs and vegetables; snack yogurt.`
        : `Lunes: desayuno yogur con avena y fruta; comida arroz con pollo y verduras; cena tortilla con ensalada; snack fruta o yogur.\nMartes: desayuno huevos y tostada; comida lentejas con verduras; cena ensalada de patata y atún; snack frutos secos.\nMiércoles: desayuno batido con avena; comida wrap de pollo; cena tofu o huevos con arroz; snack fruta.\nJueves: desayuno bol de yogur; comida ensalada de garbanzos; cena pavo o tofu con verduras; snack yogur.\nViernes: desayuno huevos y fruta; comida pasta con atún o lentejas; cena ensalada proteica; snack frutos secos.\nSábado: desayuno tostada con huevos; comida bol de arroz; cena pizza casera fácil con proteína; snack fruta.\nDomingo: desayuno yogur y avena; comida bandeja al horno o legumbres; cena ligera con huevos y verduras; snack yogur.`,
      shopping: en
        ? "Protein: chicken, eggs, yogurt, tuna or legumes. Carbs: rice, potatoes, bread or oats. Extras: frozen vegetables, fruit, olive oil."
        : "Proteína: pollo, huevos, yogur, atún o legumbres. Carbohidrato: arroz, patatas, pan o avena. Extra: verduras congeladas, fruta, aceite de oliva.",
      prep: en ? "Cook one carb base, prepare two proteins and keep emergency options ready: yogurt, eggs, tuna or legumes." : "Cocina una base de carbohidrato, deja dos proteínas listas y ten emergencias: yogur, huevos, atún o legumbres.",
      rules: en
        ? `Each main meal: palm of protein, fist of carbs, vegetables. It supports ${goal || "your goal"} with normal food. ${avoid ? `Avoid or replace: ${avoid}.` : ""}`
        : `Cada comida principal: palma de proteína, puño de carbohidrato y verduras. Encaja con ${goal || "tu objetivo"} usando comida normal. ${avoid ? `Evita o sustituye: ${avoid}.` : ""}`,
      fallback: true,
    };
  }
  if (feature === "mind_plan") {
    const need = String(body.answers?.need || "stress");
    const minutes = Math.max(3, Number(body.answers?.time || 7));
    return {
      title: en ? "Guided nervous-system reset" : "Reset guiado del sistema nervioso",
      session: en
        ? `Phase 1, 1 min: relax shoulders, jaw and hands.\nPhase 2, ${Math.max(1, minutes - 3)} min: inhale 4, exhale 6 while following the flower.\nPhase 3, 1 min: choose the next tiny action.\nPhase 4, 1 min: close with one sentence: “I only need the next step.”`
        : `Fase 1, 1 min: suelta hombros, mandíbula y manos.\nFase 2, ${Math.max(1, minutes - 3)} min: inspira 4, exhala 6 siguiendo la flor.\nFase 3, 1 min: elige la siguiente acción pequeña.\nFase 4, 1 min: cierra con una frase: “solo necesito el siguiente paso”.`,
      script: en
        ? `For ${need}, do not try to fix the whole day. Name what is here, lower the body tension and return to one visible action.`
        : `Para ${need}, no intentes arreglar el día entero. Nombra lo que hay, baja tensión del cuerpo y vuelve a una acción visible.`,
      sos: en ? "If thoughts speed up, look at one object and exhale twice as long as you inhale." : "Si los pensamientos aceleran, mira un objeto y exhala el doble de lento que inhalas.",
      followUp: en ? "Repeat once later today. If it helped, use it as your default reset for this week." : "Repítelo una vez más hoy. Si ayudó, úsalo como reset base esta semana.",
      fallback: true,
    };
  }
  if (feature === "adapt_workout") {
    return {
      title: en ? "Today, make it repeatable" : "Hoy, hazlo repetible",
      plan: en ? "Keep the first block, reduce one set per exercise if needed, and stop before technique gets messy." : "Mantén el primer bloque, reduce una serie por ejercicio si hace falta y para antes de que la técnica se ensucie.",
      why: en ? "A repeatable workout builds more momentum than a perfect one." : "Un entreno repetible crea más continuidad que uno perfecto.",
      fallback: true,
    };
  }
  return {
    title: en ? "One useful step" : "Un paso útil",
    action: en ? "Open today’s workout and complete only the first block. Continue only if it feels easy." : "Abre el entreno de hoy y completa solo el primer bloque. Sigue solo si se siente fácil.",
    why: en ? "The app should remove friction, not add pressure." : "La app debe quitar fricción, no añadir presión.",
    fallback: true,
  };
}

export const handler = async (event: HandlerEvent) => {
  if (event.httpMethod === "OPTIONS") return { statusCode: 204, headers: corsHeaders, body: "" };
  if (event.httpMethod !== "POST") return json({ error: "Method not allowed" }, 405);

  try {
    const body = JSON.parse(event.body || "{}");
    const deviceId = normalizeDeviceId(body.deviceId);
    const plusToken = bearerTokenFromHeaders(event.headers) || String(body.plusToken || "");
    const access = verifyPlusToken(plusToken, deviceId);
    const feature = String(body.feature || "");
    if (!['daily_coach', 'adapt_workout', 'nutrition_plan', 'mind_plan'].includes(feature)) return json({ error: "Función Plus no disponible" }, 400);

    const day = new Date().toISOString().slice(0, 10);
    const usageKey = `usage/${access.sub}/${day}`;
    let usageStore: UsageStore | null = null;
    let usage: Usage = { count: 0, updatedAt: "" };
    try {
      usageStore = getStore({ name: "entrenoapp-plus-ai", consistency: "strong" });
      usage = (await usageStore.get(usageKey, { type: "json" }) as Usage | null) || usage;
    } catch (usageError) {
      console.warn("plus-ai usage tracking skipped", usageError);
    }
    const dailyLimit = Math.max(1, Number(process.env.PLUS_AI_DAILY_LIMIT || 8));
    if (usage.count >= dailyLimit) return json({ error: "Has usado las recomendaciones de hoy. Mañana tendrás más." }, 429);

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return json({ error: "La IA de Plus todavía no está conectada" }, 503);
    const model = process.env.GEMINI_MODEL || "gemini-2.5-flash-lite";
    const language = body.context?.language === "en" ? "English" : "Spanish";
    const adapting = feature === "adapt_workout";
    const nutrition = feature === "nutrition_plan";
    const mind = feature === "mind_plan";
    const answers = {
      time: ['short', 'medium', 'plan'].includes(body.answers?.time) ? body.answers.time : 'plan',
      energy: ['low', 'normal', 'high'].includes(body.answers?.energy) ? body.answers.energy : 'normal',
      intent: ['complete', 'steady', 'progress'].includes(body.answers?.intent) ? body.answers.intent : 'complete',
    };
    const forcedMode = answers.time === 'short' && answers.energy === 'low'
      ? 'express_suave'
      : answers.time === 'short'
        ? 'express'
        : answers.energy === 'low'
          ? 'suave'
          : 'normal';
    const prompt = adapting
      ? `Eres EntrenoApp Plus, un entrenador amable que reduce decisiones. Escribe en ${language}. El modo seguro ya calculado es ${forcedMode}; no lo cambies. Explica de forma concreta cómo quedará la sesión de hoy usando su nombre, ejercicios y duración del contexto. No diagnostiques, no interpretes dolor, no prometas resultados y no añadas ejercicios nuevos. Devuelve frases breves, sin markdown. Respuestas del usuario: ${compactContext(answers)}. Contexto local anonimizado: ${compactContext(body.context)}`
      : nutrition
        ? `Eres EntrenoApp Plus Nutrición. Escribe en ${language}. Tu trabajo es crear algo que parezca de una app premium, no una respuesta genérica. Crea un plan de nutrición de 7 días si el usuario pide semana, y si pide día o cena, crea igualmente una versión ampliada con alternativas. Reglas: no diagnostiques, no trates enfermedades, no prometas resultados, no des calorías exactas obligatorias, no recomiendes suplementos. Usa comida normal, fácil de comprar en supermercado, porciones orientativas tipo palma/puño/plato. Respeta gustos, alergias y cosas a evitar. Si hay alergias, TCA, embarazo, enfermedad, medicación o restricción delicada, añade prudencia profesional en rules. Devuelve JSON con: title atractivo; weeklyPlan con 7 líneas, una por día, y cada día debe incluir desayuno, comida, cena y snack; shopping con lista agrupada por proteína, carbohidratos, verduras/fruta y extras; prep con pasos de preparación para que la semana sea fácil; rules con 4 reglas de adaptación para hambre, entreno fuerte, poco tiempo y restricciones. Evita markdown largo. Respuestas: ${compactContext(body.answers)}. Contexto local anonimizado: ${compactContext(body.context)}`
        : mind
          ? `Eres EntrenoApp Plus Mente. Escribe en ${language}. Crea un protocolo guiado de bienestar mental que parezca de una app premium, práctico y profundamente amable. No hagas terapia, no diagnostiques, no prometas curar ansiedad ni sueño, no uses lenguaje clínico. Debe servir para estrés, foco, ánimo o desconexión. Devuelve JSON con: title; session con fases temporizadas y acciones concretas para el tiempo elegido; script con frases internas exactas que el usuario puede repetirse; sos con una versión de 60 segundos para cuando se sature; followUp con cómo repetirlo hoy o durante 7 días. Integra respiración con flor, cuerpo, intención y cierre. Nada de frases vagas. Respuestas: ${compactContext(body.answers)}. Contexto local anonimizado: ${compactContext(body.context)}`
          : `Eres EntrenoApp Plus, un coach de hábitos y entrenamiento amable. Devuelve una única acción que pueda hacerse hoy en menos de 20 minutos en ${language}. No diagnostiques, no prescribas dietas ni suplementos y no prometas resultados. Si hay poca información, recomienda una acción suave y concreta. Contexto local anonimizado: ${compactContext(body.context)}`;
    const responseSchema = adapting
      ? { type: 'OBJECT', required: ['title', 'plan', 'why'], properties: { title: { type: 'STRING' }, plan: { type: 'STRING' }, why: { type: 'STRING' } } }
      : nutrition
        ? { type: 'OBJECT', required: ['title', 'weeklyPlan', 'shopping', 'prep', 'rules'], properties: { title: { type: 'STRING' }, weeklyPlan: { type: 'STRING' }, shopping: { type: 'STRING' }, prep: { type: 'STRING' }, rules: { type: 'STRING' } } }
        : mind
          ? { type: 'OBJECT', required: ['title', 'session', 'script', 'sos', 'followUp'], properties: { title: { type: 'STRING' }, session: { type: 'STRING' }, script: { type: 'STRING' }, sos: { type: 'STRING' }, followUp: { type: 'STRING' } } }
          : { type: 'OBJECT', required: ['title', 'action', 'why'], properties: { title: { type: 'STRING' }, action: { type: 'STRING' }, why: { type: 'STRING' } } };

    let recommendation: any;
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 14000);
      let response: Response;
      try {
        response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(apiKey)}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          signal: controller.signal,
          body: JSON.stringify({
            contents: [{ role: "user", parts: [{ text: prompt }] }],
            generationConfig: { temperature: adapting ? 0.45 : nutrition ? 0.78 : 0.74, maxOutputTokens: nutrition ? 1800 : mind ? 1100 : 320, responseMimeType: "application/json", responseSchema },
          }),
        });
      } finally {
        clearTimeout(timeout);
      }
      if (!response.ok) throw new Error(`Gemini ${response.status}`);
      const result = await response.json();
      const text = result?.candidates?.[0]?.content?.parts?.[0]?.text || "";
      recommendation = JSON.parse(text);
      if (!recommendation.title) throw new Error("Invalid AI response");
      if (adapting && (!recommendation.plan || !recommendation.why)) throw new Error("Invalid AI response");
      if (nutrition && (!recommendation.weeklyPlan || !recommendation.shopping || !recommendation.prep || !recommendation.rules)) throw new Error("Invalid AI response");
      if (mind && (!recommendation.session || !recommendation.script || !recommendation.sos || !recommendation.followUp)) throw new Error("Invalid AI response");
      if (!adapting && !nutrition && !mind && (!recommendation.action || !recommendation.why)) throw new Error("Invalid AI response");
    } catch (aiError) {
      console.warn("plus-ai fallback", aiError);
      recommendation = fallbackRecommendation(feature, body, language);
    }
    if (adapting) {
      recommendation.mode = forcedMode;
      recommendation.modeLabel = {
        normal: language === 'English' ? 'Complete' : 'Completo',
        express: language === 'English' ? 'Short' : 'Corto',
        suave: language === 'English' ? 'Gentle' : 'Suave',
        express_suave: language === 'English' ? 'Short + gentle' : 'Corto + suave',
      }[forcedMode];
    }

    usage.count += 1;
    usage.updatedAt = new Date().toISOString();
    if (usageStore) {
      try {
        await usageStore.setJSON(usageKey, usage);
      } catch (usageError) {
        console.warn("plus-ai usage save skipped", usageError);
      }
    }
    return json({ recommendation, remaining: Math.max(0, dailyLimit - usage.count) });
  } catch (error) {
    console.error("plus-ai", error);
    const message = error instanceof Error && /expired|invalid access token|access belongs|device/i.test(error.message)
      ? "Tu acceso Plus ha caducado"
      : "La recomendación no está disponible ahora";
    return json({ error: message }, /caducado/.test(message) ? 401 : 500);
  }
};
