// Prueba de ejemplo de create-vue. Vitest toma como prueba todo archivo *.spec.js o *.test.js.
// describe agrupa casos, it declara uno y expect comprueba un resultado.
import { describe, it, expect } from 'vitest'

import { mount } from '@vue/test-utils'   // Vue Test Utils: monta un componente dentro de jsdom
import App from '../App.vue'

describe('App', () => {
  it('mounts renders properly', () => {
    const wrapper = mount(App)                        // wrapper: envoltorio para leer y manipular el componente
    expect(wrapper.text()).toContain('You did it!')   // comprueba lo que vería la persona
  })
})
