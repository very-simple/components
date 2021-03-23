import { walkComponent, isString } from './utils/utils.js'

/**
 * @typedef {Object<string, HTMLElement | Array<HTMLElement>>} Refs
 */

/**
 * @typedef {(el: HTMLElement) => object?} Component
 */

/** @type {Object<string, Component>} */
const components = {}

/**
 * @private
 * @param {HTMLElement} el
 * @returns {Component}
 */
const getComponent = el => components[el.dataset.component]

/**
 * @param {string} name
 * @param {Component} component
 * @returns {Component}
 */
export const registerComponent = (name, component) => {
  if (typeof component !== 'function') {
    throw new Error(`Component ${name} is not a function.`)
  }
  components[name] = component
  return component
}

/**
 * Mount a single component.
 * @param {HTMLElement} el
 */
export const mountComponent = (el, isChild = false) => {
  const component = getComponent(el)
  if (component) {
    /* @ts-ignore */
    el.__very_instance = component(el)
  }

  if (!isChild) {
    mountChildComponents(el)
  }
}

/** @param {HTMLElement} el */
const mountChildComponents = el => {
  const elements = el.querySelectorAll('[data-component]')
  for (let i = 0; i < elements.length; i++) {
    const el = /** @type {HTMLElement} */ (elements[i])
    mountComponent(el, true)
  }
}

/**
 * Mount all components inside the element.
 * @param {HTMLElement} root - The containing element.
 */
export const mountComponents = (root = document.body) => {
  mountComponent(root)
}

/**
 * @param {string | HTMLElement} el An element (or an id).
 */
export const getInstance = el =>
  // @ts-ignore
  (isString(el) ? document.getElementById(el) : el)?.__very_instance

/**
 * @param {HTMLElement} el
 * @returns {Refs}
 */
export const getRefs = el => {
  /** @type {Refs} */
  const refs = {}
  walkComponent(el, el => {
    const { ref } = el.dataset
    if (ref) {
      const entry = refs[ref]
      if (!entry) {
        refs[ref] = el
      } else if (Array.isArray(entry)) {
        entry.push(el)
      } else {
        refs[ref] = [entry, el]
      }
    }
  })
  return refs
}
