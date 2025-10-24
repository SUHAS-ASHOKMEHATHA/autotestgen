function sum(a, b) {
  return a + b;
}
function clamp(x, min, max) {
  if (min > max) throw new Error('min>max');
  if (x < min) return min;
  if (x > max) return max;
  return x;
}
module.exports = { sum, clamp };
