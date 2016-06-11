var chai = require('chai');
var expect = chai.expect; // we are using the "expect" style of Chai
var ModelExample = require('./../index');
var fs = require('fs');

var swagger = JSON.parse(fs.readFileSync("./spec/swagger.json", 'UTF-8'));

describe('Model Example', function() {
  it('Should Find the Pet Definition', function() {
    //var modelExample = new ModelExample();

    var definition = ModelExample.findRefDefinition("#/definitions/Pet", swagger);
    expect(definition).not.to.be.null;
  });

  it('Should parse the Pet Definition', function() {
      var definition = ModelExample.findRefDefinition("#/definitions/Pet", swagger);

      var example = ModelExample.getModelExample(definition, swagger, true);
      console.log(example);
  });
});
