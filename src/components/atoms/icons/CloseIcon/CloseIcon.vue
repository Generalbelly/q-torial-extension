<script>
export default {
  name: 'CloseIcon',
  props: {
    el: {
      type: String,
      default: 'span',
    },
    size: {
      type: String,
      default: null,
    },
  },
  render(createElement) {
    const self = this
    return createElement(
      self.el,
      {
        class: self.size ? `delete ${self.size}` : 'delete',
        on: {
          click(event) {
            self.$emit('click', event)
          },
        },
      },
      self.$slots.default
    )
  },
}
</script>
