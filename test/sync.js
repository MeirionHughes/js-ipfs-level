/* eslint-env mocha */
'use strict'

const chai = require('chai')
chai.use(require('dirty-chai'))
const expect = chai.expect

const Memdown = require('memdown')
const each = require('async/each')
const series = require('async/series')
const parallel = require('async/parallel')

const IPFSLevel = require('../')
const createRepo = require('./utils/create-repo')

const PARTITION = 'sync-test'

describe('sync', () => {
  const repos = []
  let db1, db2

  before((done) => {
    const repo = createRepo()
    repos.push(repo)
    db1 = IPFSLevel(PARTITION, {
      ipfsOptions: {
        repo: repo
      },
      log: Memdown(PARTITION + ':db1')
    })
    db1.open(done)
  })

  before((done) => {
    const repo = createRepo()
    repos.push(repo)
    db2 = IPFSLevel(PARTITION, {
      ipfsOptions: {
        repo: repo
      },
      log: Memdown(PARTITION + ':db2')
    })
    db2.open(done)
  })

  after((done) => setTimeout(done, 6000))

  after((done) => db1.close(done))
  after((done) => db2.close(done))
  after((done) => each(repos, (repo, cb) => repo.teardown(cb), done))

  it('put in one is replicated', (done) => {
    series([
      (callback) => db1.put('key', 'value', callback),
      (callback) => setTimeout(callback, 6000),
      (callback) => {
        db2.get('key', (err, result) => {
          expect(err).to.not.exist()
          expect(result).to.equal('value')
          done()
        })
      }
    ], done)
  })

  describe('concurrent put is replicated', () => {
    before((done) => parallel([
      (callback) => db1.put('key 1', 'value 1', callback),
      (callback) => db2.put('key 2', 'value 2', callback)
    ], done))

    before((done) => setTimeout(done, 6000))

    it('merged', (done) => {
      parallel([
        (callback) => {
          db2.get('key 1', (err, result) => {
            expect(err).to.not.exist()
            expect(result).to.equal('value 1')
            callback()
          })
        },
        (callback) => {
          db1.get('key 2', (err, result) => {
            expect(err).to.not.exist()
            expect(result).to.equal('value 2')
            callback()
          })
        }
      ], done)
    })
  })
})
