# ipfs-level

> Leveldown over IPFS

[![Build Status](https://travis-ci.org/pgte/ipfs-level.svg?branch=master)](https://travis-ci.org/pgte/ipfs-level)

# Install

```bash
$ npm install ipfs-level --save
```

# Import

```js
const IPFSLevel = require('ipfs-level')
```

# API

## IPFSLevel(partition[, options])

Returns a new IPFSLevel instance. This object obeys [the LevelDown interface](https://github.com/level/leveldown).

Arguments:

* `options` (object, defaults to [this](src/default-options.js)): with the following keys:
  * `ipfsOptions` (object). [IPFS options object](https://github.com/ipfs/js-ipfs#advanced-options-when-creating-an-ipfs-node).
  * `heads` (LevelDown-compatible database that stores the heads)


# License

MIT

## Contribute

Feel free to join in. All welcome. Open an [issue](https://github.com/pgte/ipfs-level/issues)!

This repository falls under the IPFS [Code of Conduct](https://github.com/ipfs/community/blob/master/code-of-conduct.md).

[![](https://cdn.rawgit.com/jbenet/contribute-ipfs-gif/master/img/contribute.gif)](https://github.com/ipfs/community/blob/master/contributing.md)

## License

[MIT](LICENSE)
