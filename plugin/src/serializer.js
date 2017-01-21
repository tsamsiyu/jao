import _ from 'lodash';

export default function serialize(data, options) {
    if (Array.isArray(data)) {
        return serializeArray(data, options);
    } else {
        return serializeObject(data, options);
    }
}

const serializeArray = function (array, options) {

};

const serializeObject = function (object, options) {
    const serialized = {
        data: serializeObjectData(null, object, options),
    };
    const included = serializeObjectIncluded(object, options);
    if (included.length) {
        serialized.included = included;
    }
    return serialized;
};

const serializeObjectIncluded = function (object, options, includedIndexesHashMap = {}) {
    let included = [];
    _.forEach(object, (item, key) => {
        if (key !== 'id') {
            if (Array.isArray(item)) {
                _.forEach(item, (relObject) => {
                    const serializedIncludedObject = serializeObjectData(key, relObject, options);
                    const strindex = serializedIncludedObject.id + ':' + serializedIncludedObject.type;
                    if (!includedIndexesHashMap[strindex]) {
                        includedIndexesHashMap[strindex] = true;
                        included.push(serializedIncludedObject);
                        included = included.concat(serializeObjectIncluded(relObject, options, includedIndexesHashMap));
                    }
                });
            } else if (typeof item === 'object') {
                const serializedIncludedObject = serializeObjectData(key, item, options);
                const strindex = serializedIncludedObject.id + ':' + serializedIncludedObject.type;
                if (!includedIndexesHashMap[strindex]) {
                    includedIndexesHashMap[strindex] = true;
                    included.push(serializedIncludedObject);
                    included = included.concat(serializeObjectIncluded(item, options, includedIndexesHashMap));
                }
            }
        }
    });
    return included;
};

const serializeObjectData = function (key, object, options) {
    const data = serializeObjectIndex(key, object, options);
    let hasRelationships = false;
    let hasAttributes = false;
    const attributes = {};
    const relationships = {};
    _.forEach(object, (item, key) => {
        if (key !== 'id') {
            if (typeof item === 'string' || typeof item === 'number') {
                attributes[key] = item;
                hasAttributes = true;
            } else if (Array.isArray(item)) {
                relationships[key] = serializeArrayRelationship(key, item, options);
                hasRelationships = true;
            } else if (typeof item === 'object') {
                relationships[key] = serializeObjectRelationship(key, item, options);
                hasRelationships = true;
            }
        }
    });
    if (hasAttributes) {
        data.attributes = attributes;
    }
    if (hasRelationships) {
        data.relationships = relationships;
    }
    return data;
};

const serializeObjectRelationship = function (name, object, options) {
    return {data: serializeObjectIndex(name, object, options)};
};

const serializeArrayRelationship = function (name, array, options) {
    return {
        data: _.map(array, (object) => {
            return serializeObjectIndex(name, object, options);
        })
    };
};

const serializeObjectIndex = function (name, object, options) {
    return {
        id: object.id,
        type: getObjectType(name, options)
    };
};

const getObjectType = function (name, options) {
    return name ? _.get(options.types, name, name) : options.type;
};