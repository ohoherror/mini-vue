import { computed } from '../computed'
import { reactive } from '../reactive'

describe("computed", () => {
    it('happy path', () => {
        const user = reactive({ age: 1 })
        const age = computed(() => {
            return user.age
        })
        expect(age.value).toBe(1)
    })

    it('should computed lazily', () => {
        const value = reactive({ foo: 1 })
        const getter = jest.fn(() => value.foo)
        const cValue = computed(getter)

        // lazy
        expect(getter).not.toHaveBeenCalled()
        // 触发 get 操作时传入的 getter 会被调用一次
        expect(cValue.value).toBe(1)
        expect(getter).toHaveBeenCalledTimes(1)

        // 不会再次调用 computed
        cValue.value
        expect(getter).toHaveBeenCalledTimes(1)
        //需要收集依赖，在调用getter的时候，不然在set的时候不会调用getter
        value.foo = 2
        expect(getter).toHaveBeenCalledTimes(1)
    })
})