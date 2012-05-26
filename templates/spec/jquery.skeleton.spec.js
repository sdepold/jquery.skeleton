buster.spec.expose()

describe('jquery.skeleton', function() {
  before(function() {
    this.element = jQuery('<div>').appendTo(jQuery('body'))
  })

  it('prints "skeleton"', function() {
    this.element.skeleton()
    expect(this.element.text()).toEqual('skeleton')
  })
})
