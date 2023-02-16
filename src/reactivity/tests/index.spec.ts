import { add } from '../index'

it('init', () => {
    expect(true).toBe(true)
})

it("init", () => {
    expect(add(1, 1)).toBe(2)
})