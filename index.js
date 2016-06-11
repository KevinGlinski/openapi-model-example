
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

export.getModelDefinition = function(isResponse, swagger, modelName, depth){
    if(typeof(modelName) === "undefined"){
        return "";
    }
    var modelName = modelName.replace('#/definitions/','');
    if(depth >1){
        return "{}";
    }

    var definition = [];

    var properties = swagger.definitions[modelName].properties;
    for(var name in properties){
        var defaultValue = '""';
        if(properties[name]["$ref"]){
            defaultValue = getModelDefinition(isResponse, swagger, properties[name]["$ref"], depth + 1);
        }else{
            defaultValue = getDefaultValue(properties[name].type);
        }

        if(isResponse === true || properties[name].readOnly !== true){
            definition.push('"' + name + '" : ' + defaultValue );
        }
    }

    return JSON.stringify(JSON.parse("{" + definition.join(',') + "}"), null, "   ");
};
