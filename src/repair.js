const { warn } = require('./utils/logger');

function sanitizeTestCode(aiText) {
  if (!aiText) return '';
  const fence = /```(?:javascript|js|ts|typescript)?\s*([\s\S]*?)```/gi;
  const blocks = [...aiText.matchAll(fence)].map(m => m[1].trim());
  let code = blocks[0] || aiText;

  const lines = code.split(/\r?\n/);
  const isStart = l => /^\s*(const|let|var|import|require\(|describe\(|module\.exports|it\(|before\(|after\()\b/.test(l);
  const firstIdx = lines.findIndex(isStart);
  if (firstIdx > 0) code = lines.slice(firstIdx).join('\n');

  code = code.replace(/^#+\s.*$/gm, '').trim();
  return code + '\n';
}

async function repairIfNeeded({ failingOutput, currentTestCode, code, exportNames }) {
  if (!failingOutput) return null;
  try {
    const OpenAI = require('openai');
    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const prompt = `Only output a single corrected Mocha+Chai test file as a fenced code block.
Fix ONLY failing or weak tests. Keep passing tests unchanged. No explanations.

--- FAILING OUTPUT ---
${failingOutput}

--- CURRENT TEST FILE ---
${currentTestCode}

--- SOURCE CODE ---
${code}
`;
    const res = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.2,
    });
    const raw = res.choices?.[0]?.message?.content || "";
    const sanitized = sanitizeTestCode(raw);
    return sanitized && sanitized.includes('describe(') ? sanitized : null;
  } catch (e) {
    warn("Repair step skipped (no OpenAI?).", e.message);
    return null;
  }
}

module.exports = { repairIfNeeded };
