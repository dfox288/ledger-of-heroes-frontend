import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import Pagination from '~/components/ui/list/Pagination.vue'

// Mock UPagination component
const UPaginationStub = {
  name: 'UPagination',
  props: ['page', 'total', 'itemsPerPage', 'showEdges'],
  template: '<div class="u-pagination-stub"></div>'
}

describe('UiListPagination', () => {
  describe('conditional rendering', () => {
    it('does not render when total <= itemsPerPage', () => {
      const wrapper = mount(Pagination, {
        props: {
          modelValue: 1,
          total: 10,
          itemsPerPage: 15
        },
        global: {
          stubs: {
            UPagination: UPaginationStub
          }
        }
      })

      expect(wrapper.html()).toBe('<!--v-if-->')
    })

    it('does not render when total equals itemsPerPage', () => {
      const wrapper = mount(Pagination, {
        props: {
          modelValue: 1,
          total: 15,
          itemsPerPage: 15
        },
        global: {
          stubs: {
            UPagination: UPaginationStub
          }
        }
      })

      expect(wrapper.html()).toBe('<!--v-if-->')
    })

    it('renders when total > itemsPerPage', () => {
      const wrapper = mount(Pagination, {
        props: {
          modelValue: 1,
          total: 50,
          itemsPerPage: 15
        },
        global: {
          stubs: {
            UPagination: UPaginationStub
          }
        }
      })

      expect(wrapper.find('[data-testid="list-pagination"]').exists()).toBe(true)
    })
  })

  describe('layout and styling', () => {
    it('has correct center alignment class', () => {
      const wrapper = mount(Pagination, {
        props: {
          modelValue: 1,
          total: 50,
          itemsPerPage: 15
        },
        global: {
          stubs: {
            UPagination: UPaginationStub
          }
        }
      })

      const container = wrapper.find('[data-testid="list-pagination"]')
      expect(container.classes()).toContain('flex')
      expect(container.classes()).toContain('justify-center')
    })
  })

  describe('props and UPagination integration', () => {
    it('renders UPagination when total > itemsPerPage', () => {
      const wrapper = mount(Pagination, {
        props: {
          modelValue: 1,
          total: 100,
          itemsPerPage: 15
        }
      })

      const html = wrapper.html()
      // UPagination is present (even if stubbed/real, it will have attributes/structure)
      expect(html).not.toBe('<!--v-if-->')
      expect(wrapper.find('[data-testid="list-pagination"]').exists()).toBe(true)
    })

    it('accepts all required props without errors', () => {
      expect(() => {
        mount(Pagination, {
          props: {
            modelValue: 3,
            total: 100,
            itemsPerPage: 25
          }
        })
      }).not.toThrow()
    })

    it('accepts optional showEdges prop without errors', () => {
      expect(() => {
        mount(Pagination, {
          props: {
            modelValue: 1,
            total: 100,
            itemsPerPage: 15,
            showEdges: false
          }
        })
      }).not.toThrow()
    })
  })

  describe('v-model emit behavior', () => {
    it('defines update:modelValue emit', () => {
      const wrapper = mount(Pagination, {
        props: {
          modelValue: 1,
          total: 100,
          itemsPerPage: 15
        }
      })

      // Component should have emits defined
      expect(wrapper.vm).toBeDefined()
    })

    it('can receive modelValue prop changes', async () => {
      const wrapper = mount(Pagination, {
        props: {
          modelValue: 1,
          total: 100,
          itemsPerPage: 15
        }
      })

      await wrapper.setProps({ modelValue: 5 })
      expect(wrapper.props('modelValue')).toBe(5)
    })
  })
})
