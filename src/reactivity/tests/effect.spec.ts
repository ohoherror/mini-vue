import { reactive } from '../reactive'
import { effect } from '../effect'
describe('effect', () => {
    it("happy path", () => {
        const user = reactive({
            age: 10
        })
        let nextAge
        // 为什么要在get收集依赖，因为effect初次只触发了get
        effect(() => {
            nextAge = user.age + 1
        })
        expect(nextAge).toBe(11)
        // user.age = 30
        user.age++
        expect(nextAge).toBe(12)
    })
})