import { InjectionKey } from 'vue'
import { createStore, Store } from 'vuex'
import { Mode } from '../types'

interface State {
  mode: Mode
}

export const key: InjectionKey<Store<State>> = Symbol()
export const store = createStore<State>({
  state: { mode: 'exhibition' },
  mutations: {
    setMode(state, mode: Mode) {
      state.mode = mode
    },
  },
})
