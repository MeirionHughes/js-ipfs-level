'use strict'

const EventEmitter = require('events')
const backoff = require('backoff').exponential
const debug = require('debug')('ipfs-level:sync')

const Room = require('./room')

const BACKOFF_OPTIONS = {
  initialDelay: 100,
  maxDelay: 10000
}

module.exports = class Sync extends EventEmitter {
  constructor (nodeId, partition, log, ipfs) {
    super()
    this._nodeId = nodeId
    this._topic = '/ipfs-level/' + partition
    this._log = log
    this._ipfs = ipfs
    this._head = undefined
    this._stopped = false

    this._backoff = backoff(BACKOFF_OPTIONS)
    this._backoff.on('ready', this._broadcast.bind(this))
    this._backoff.backoff()

    this._room = new Room(this._topic, ipfs)
    this._room.on('peer joined', () => this._backoff.reset())
    this._room.on('error', (err) => this.emit('error', err))

    this._ipfs.pubsub.subscribe(this._topic, this._onMessage.bind(this))
  }

  setNewHead (head) {
    debug('setting new head to %s', head)
    this._head = head
    this._backoff.reset()
    this._backoff.backoff()
  }

  stop () {
    this._stopped = true
    this._room.close()
  }

  _broadcast () {
    debug('_broadcast')
    if (this._stopped) {
      return
    }

    if (this._head) {
      debug('broadcasting head. topic = %s, head = %s', this._topic, this._head)
      this._ipfs.pubsub.publish(this._topic, Buffer.from(this._head), (err) => {
        if (err) {
          this.emit('error', err)
        }
        this._backoff.backoff()
      })
    } else {
      debug('no head yet')
      this._backoff.backoff()
    }
  }

  _onMessage (message) {
    if (message.from !== this._nodeId) {
      this.emit('message', message.data.toString())
    }
  }
}
