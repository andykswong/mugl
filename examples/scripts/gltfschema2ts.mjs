import * as https from 'https';
import * as fs from 'fs';
import * as path from 'path';
import { URL } from 'url';
import refParser from 'json-schema-ref-parser';
import json2ts from 'json-schema-to-typescript';

const outputPath = process.argv[2];
const glTFRepoPath = 'https://raw.githubusercontent.com/KhronosGroup/glTF/master';
const glTFSchemaBasePath = `${glTFRepoPath}/specification/2.0/schema`;
const glTFExtensionsBasePath = `${glTFRepoPath}/extensions/2.0`;

function getExtensionSchemaPath(name) {
  return `${glTFExtensionsBasePath}/Khronos/${name}/schema/glTF.${name}.schema.json`;
}

const schemas = {
  glTF2: `${glTFSchemaBasePath}/glTF.schema.json`,
  KHR_lights_punctual: getExtensionSchemaPath('KHR_lights_punctual'),
  KHR_techniques_webgl: getExtensionSchemaPath('KHR_techniques_webgl')
};

const glTFSchemaResolver = {
  order: 300,
  canRead: /^https?:/i,
  read(file) {
    const fileName = path.posix.basename(new URL(file.url).pathname);
    return httpsGet(`${glTFSchemaBasePath}/${fileName}`);
  }
};

/**
 * Convert the given schema to Typescript at outputPath.
 */
function schema2ts(outputPath, schemaPath) {
  refParser.dereference(schemaPath, { resolve: { gltf: glTFSchemaResolver }})
    .then(schema => json2ts.compile(transform(schema)))
    .then((definition) => {
      fs.writeFile(outputPath, definition, (err) => {
        if (err) throw err;
        console.log(`Schema written to ${outputPath}`);
      });
    });
}

/**
 * json-schema-to-typescript ignores "properties" when "allOf" is used.
 * This is a workaround to attempt to fix the issue.
 * @see https://github.com/bcherny/json-schema-to-typescript/issues/96
 */
function transform(schema) {
  const properties = {};
  if (schema.properties) {
    for (const property of Object.keys(schema.properties)) {
      properties[property] = transform(schema.properties[property]);
    }
    schema.properties = properties;
  }
  if (schema.allOf) {
    for (let i = 0; i < schema.allOf.length; ++i) {
      schema.allOf[i] = transform(schema.allOf[i]);
    }
    if (schema.properties && Object.keys(schema.properties).length) {
      schema.allOf.push({
        title: schema.title,
        type: schema.type,
        required: schema.required,
        properties
      });
      schema.properties = {};
    }
  }
  if (schema.items) {
    schema.items = transform(schema.items);
  }

  return schema;
} 

function httpsGet(url) {
  return new Promise((resolve, reject) => {
    https.get(url, res => {
      res.setEncoding('utf8');
      let body = ''; 
      res.on('data', chunk => body += chunk);
      res.on('end', () => resolve(body));
    }).on('error', reject);
  });
};

// Generate the Typescript definitions at outputPath
fs.mkdirSync(outputPath, { recursive: true });
for (const schemaName of Object.keys(schemas)) {
  schema2ts(`${outputPath}/${schemaName}.ts`, schemas[schemaName]);
}
