import { InjectionKey } from 'vue'
import { createStore, Store } from 'vuex'

interface State {
  setupMode: boolean
}

export const key: InjectionKey<Store<State>> = Symbol()
export const store = createStore<State>({
  state: { setupMode: true },
  mutations: {
    setSetupMode(state, setupMode: boolean) {
      state.setupMode = setupMode
    },
  },
})
