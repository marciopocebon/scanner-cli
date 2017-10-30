'use strict';
const Safety = require('../../lib/modules/safety');
const FileManager = require('../../lib/fileManager');
const deride = require('deride');
const path = require('path');
const should = require('should');

describe('Safety', () => {
  let sample = require('../samples/safety.json');
  let safety, mockExec, mockResults;
  beforeEach(() => {
    mockExec = deride.stub(['command']);
    mockExec.setup.command.toCallbackWith(null, {
      stdout: JSON.stringify(sample)
    });
    const nullLogger = deride.stub(['log', 'debug', 'error']);
    const fileManager = new FileManager({
      target: path.join(__dirname, '../samples/python'),
      logger: nullLogger
    });

    mockResults = deride.stub(['low', 'medium', 'high', 'critical']);
    safety = new Safety({
      exec: mockExec
    });
    should(safety.handles(fileManager)).eql(true);
  });

  it('should execute safety check --json -r requirements.txt', done => {
    safety.run(mockResults, () => {
      mockExec.expect.command.called.withArg('safety check --json -r requirements.txt');
      done();
    });
  });

  it('should pass the whole advisory back as data', done => {
    safety.run(mockResults, () => {
      mockResults.expect.high.called.twice();
      done();
    });
  });

  it('should parse the advisory properly', done => {
    safety.run(mockResults, () => {
      const item = {
        "code":"25853",
        "offender":"insecure-package 0.1",
        "description":"This is an insecure package with lots of exploitable security vulnerabilities.",
        "mitigation":"<0.2.0"
      };

      mockResults.expect.high.called.withArgs(item);
      done();
    });
  });

});
