

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

function getModelDescription(isResponse, swagger, definitions, modelName, depth){

    if(modelName == null || definitions[modelName] || depth >2){
        return definitions;
    }

    modelName = modelName.replace(/#\/definitions\//,'');

    if(swagger["definitions"][modelName] == null){
        return definitions;
    }

    var model = swagger["definitions"][modelName];
    var properties = model["properties"];

    if(properties == null){
        return definitions;
    }

    propertyDescriptions = [];

    for(var key in properties){
        var property = properties[key];
        if(isResponse && property.readonly != true){
            propertyDescriptions.push(processPropertyDescription(isResponse,swagger, definitions, model,depth, key,property));
        }
    }

    definitions[modelName] = propertyDescriptions

    return definitions;
}
function processPropertyDescription(isResponse, swagger, definitions, model, depth,  name, property){
    var readonlyString = property["readOnly"] == true ? ", read only" : "";
    var isRequired = model["required"] !=null &&  model["required"].indexOf(name) > -1;
    var required = isRequired ? ", required" : ", optional";
    var description = property['description'] || "";
    var type = property["type"];

    if(property["$ref"] != null){
        type= property["$ref"]
        getModelDescription(isResponse, swagger, definitions, property["$ref"], depth + 1);
    }
    else if(property["items"] && property["items"]["$ref"]){

        type= "array:" + property["items"]["$ref"]
        getModelDescription(isResponse, swagger, definitions, property["items"]["$ref"], depth + 1);
    }
/*
    }else if(property["items"] && property["items"]["properties"]){
        type= "array"
        get_inline_model_description(isResponse, swagger, definitions, property["items"], name, depth + 1);
    }else if (property["type"] == "object")
        get_inline_model_description(isResponse, swagger, definitions, property, name, depth + 1);
        */
    else if (property["items"] && property["items"]["enum"]){
        description = description + " Valid Values: " + property["items"]["enum"].join(", ")
    }
    else if ( property["enum"]){
        description = description + " Valid Values: " + property["enum"].join(", ")
    }

    var propertyDefinition = {
        name : name,
        type: type,
        required: required,
        readonlyString: readonlyString,
        description: description
    };

    return definitions;
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

app.getModelDescription = function(modelName, swagger, isResponse){
    var descriptionHash = getModelDescription(isResponse, swagger, {}, modelName ,0);
    console.log(descriptionHash);
    var descriptionArray = [];

    for(var key in descriptionHash){
        descriptionArray.push({
            name: key,
            definitions: descriptionHash[key]
        });
    }

    return descriptionArray;
};

app.findRefDefinition = findRefDefinition;
module.exports = app;
