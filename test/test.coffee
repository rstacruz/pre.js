load = require('../')
expect = require('chai').expect

beforeEach -> global.sinon = require('sinon').sandbox.create()
afterEach  -> global.sinon.restore()

describe 'load', ->
  beforeEach ->
    global.yepnope = ->

  it 'defaults', ->
    ctx = load()
    expect(ctx.load).have.length 0

  it '.css', ->
    ctx = load()
      .css('foo.css')
    expect(ctx.load).have.length 1
    expect(ctx.load[0]).eq 'css!foo.css'
