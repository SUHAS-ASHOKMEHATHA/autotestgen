const { warn } = require('./utils/logger');

function sanitizeTestCode(aiText) {
  if (!aiText) return '';
  // Prefer the first fenced code block
  const fence = /```(?:javascript|js|ts|typescript)?\s*([\s\S]*?)```/gi;
  const blocks = [...aiText.matchAll(fence)].map(m => m[1].trim());
  let code = blocks[0] || aiText;

  // Drop any leading prose until a JS-looking line
  const lines = code.split(/\r?\n/);
  const isStart = l => /^\s*(const|let|var|import|require\(|describe\(|module\.exports|it\(|before\(|after\()\b/.test(l);
  const firstIdx = lines.findIndex(isStart);
  if (firstIdx > 0) code = lines.slice(firstIdx).join('\n');

  // Remove markdown headings, trim
  code = code.replace(/^#+\s.*$/gm, '').trim();
  return code + '\n';
}

async function generateTestWithOpenAI(code, exportNames) {
  try {
    const OpenAI = require('openai');
    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const plan = exportNames.length ? `Target exports: ${exportNames.join(', ')}` : 'No named exports found.';
    const prompt = `You are a Mocha+Chai unit test writer (CommonJS require).
Rules: No network/file I/O, no sleeps, deterministic inputs, specific assertions.
Output ONLY a single JavaScript test file as a fenced code block. No explanations.

${plan}

--- CODE START ---
${code}
--- CODE END ---`;

    const res = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.2,
    });
    const raw = res.choices?.[0]?.message?.content || "";
    return sanitizeTestCode(raw);
  } catch (e) {
    warn("OpenAI not available or failed. Falling back to mock generator. Reason:", e.message);
    return null;
  }
}

function mockGenerate(code, exportNames) {
  const usingSum = exportNames.includes('sum') || /function\s+sum\s*\(/.test(code);
  const mock = usingSum ? `
const { expect } = require('chai');
const { sum, clamp } = require('../examples/math.js');
describe('sum()', () => {
  it('adds positives', () => { expect(sum(2,3)).to.equal(5); });
  it('handles negatives', () => { expect(sum(-2,3)).to.equal(1); });
  it('handles decimals', () => { expect(sum(2.5,0.5)).to.equal(3); });
});
describe('clamp()', () => {
  it('returns min when below range', () => { expect(clamp(1, 3, 5)).to.equal(3); });
  it('returns max when above range', () => { expect(clamp(9, 3, 5)).to.equal(5); });
  it('passes through when in range', () => { expect(clamp(4, 3, 5)).to.equal(4); });
});
` : `
const { expect } = require('chai');
describe('module', () => {
  it('placeholder', () => expect(true).to.equal(true));
});
`;
  return sanitizeTestCode(mock);
}

async function generateTests({ code, exportNames }) {
  const ai = await generateTestWithOpenAI(code, exportNames);
  if (ai && ai.includes('describe(')) return ai;
  return mockGenerate(code, exportNames);
}

module.exports = { generateTests };
