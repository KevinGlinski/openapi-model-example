

function getDefaultValue(type){

    switch (type) {
        case 'integer':
        return 0;
        break;
        case 'array':
        return '[]';
        break;
        case 'boolean':
        return 'true';
        break;
        case 'string':
        return '""';
        break;
        default:
        return "{}";

    }
}

function getModelExampleFromModelName(isResponse, swagger, modelName, depth){
    var refDefinition = findRefDefinition(modelName, swagger);
    return getModelExample(isResponse, swagger, refDefinition, depth + 1);
}

function getModelExample(isResponse, swagger, modelDefinition, depth){

    if(depth >1){
        return "{}";
    }

    var definition = [];

    var properties = modelDefinition.properties;

    for(var name in properties){
        var defaultValue = '""';
        if(properties[name]["$ref"]){
            var refDefinition = findRefDefinition(properties[name]["$ref"], swagger);
            defaultValue = getModelExample(isResponse, swagger, refDefinition, depth + 1);
        }else{
            defaultValue = getDefaultValue(properties[name].type);
        }

        if(isResponse === true || properties[name].readOnly !== true){
            definition.push('"' + name + '" : ' + defaultValue );
        }
    }

    return JSON.stringify(JSON.parse("{" + definition.join(',') + "}"), null, "   ");
}

function findRefDefinition(refModelName, swagger){
    if(typeof(refModelName) === "undefined"){
        return {};
    }
    var modelName = refModelName.replace('#/definitions/','');
    var properties = swagger.definitions[modelName];
    return properties;
}

var app = {};
app.getModelExample = function(modelName, swagger, isResponse){
    var definition = findRefDefinition(modelName, swagger);
    return getModelExample(isResponse, swagger, definition ,0);
};
app.findRefDefinition = findRefDefinition;
module.exports = app;
