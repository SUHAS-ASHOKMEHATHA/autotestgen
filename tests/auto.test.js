const { expect } = require('chai');
const { sum, clamp } = require('../examples/math.js');

describe('sum', () => {
  it('should return the sum of two positive numbers', () => {
    expect(sum(2, 3)).to.equal(5);
  });

  it('should return the sum of a positive and a negative number', () => {
    expect(sum(5, -3)).to.equal(2);
  });

  it('should return the sum of two negative numbers', () => {
    expect(sum(-2, -3)).to.equal(-5);
  });

  it('should return zero when summing zero with zero', () => {
    expect(sum(0, 0)).to.equal(0);
  });
});

describe('clamp', () => {
  it('should return the value when it is within the range', () => {
    expect(clamp(5, 1, 10)).to.equal(5);
  });

  it('should return the minimum when the value is below the range', () => {
    expect(clamp(0, 1, 10)).to.equal(1);
  });

  it('should return the maximum when the value is above the range', () => {
    expect(clamp(15, 1, 10)).to.equal(10);
  });

  it('should throw an error when min is greater than max', () => {
    expect(() => clamp(5, 10, 1)).to.throw('min>max');
  });
});
