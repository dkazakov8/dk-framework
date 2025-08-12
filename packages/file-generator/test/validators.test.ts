/* eslint-disable @typescript-eslint/naming-convention*/

import fs from 'node:fs';
import path from 'node:path';

import { expect } from 'chai';
import fsExtra from 'fs-extra';
import { createCheckers } from 'ts-interface-checker';

import { fileEncoding } from '../src/const';
import { ValidatorsGenerator } from '../src/plugins/validators';

const resultContent: Record<string, string> = {
  'getUser.ts': `import * as t from "ts-interface-checker";
// tslint:disable:object-literal-key-quotes
import * as AllImports0 from '../models/TypeUser';

export const TypeRequest = t.iface([], {
});

export const TypeResponse = t.name("TypeUser");

const exportedTypeSuite: t.ITypeSuite = {
  TypeRequest,
  TypeResponse,
  ...AllImports0,
};
export default exportedTypeSuite;
`,
  'getUserExtended.ts': `import * as t from "ts-interface-checker";
// tslint:disable:object-literal-key-quotes
import * as AllImports0 from '../models/TypeUserExtended';

export const TypeRequest = t.iface([], {
  "id": "string",
});

export const TypeResponse = t.name("TypeUserExtended");

const exportedTypeSuite: t.ITypeSuite = {
  TypeRequest,
  TypeResponse,
  ...AllImports0,
};
export default exportedTypeSuite;
`,
  'TypeRole.ts': `import * as t from "ts-interface-checker";

export const TypeRole = t.union(t.lit('manager'), t.lit('admin'));`,
  'TypeTaskStatus.ts': `import * as t from "ts-interface-checker";

export const TypeTaskStatus = t.union(t.lit(0), t.lit(1), t.lit(2), t.lit(3));`,
  'TypeUser.ts': `import * as t from "ts-interface-checker";

export * from './TypeRole';

export * from './tasks/TypeTaskAny';

export const TypeUser = t.iface([], {
  "email": "string",
  "name": "string",
  "task": "TypeTaskAny",
  "role": "TypeRole",
  "someData": t.array(t.tuple("number", "string")),
});`,
  'TypeUserExtended.ts': `import * as t from "ts-interface-checker";

export * from './TypeRole';

export * from './TypeUser';

export const TypeUserExtended = t.intersection("TypeUser", t.iface([], {
  "role": "TypeRole",
  "gender": "string",
}));`,
  'TypeTask.ts': `import * as t from "ts-interface-checker";

export * from '../TypeTaskStatus';

export const TypeTask = t.iface([], {
  "test": "string",
  "status": "TypeTaskStatus",
});`,
  'TypeTaskAny.ts': `import * as t from "ts-interface-checker";

export * from './TypeTaskReceiving';

export * from './TypeTaskStow';

export const TypeTaskAny = t.union("TypeTaskStow", "TypeTaskReceiving");`,
  'TypeTaskReceiving.ts': `import * as t from "ts-interface-checker";

export * from './TypeTask';

export const TypeTaskReceiving = t.intersection("TypeTask", t.iface([], {
  "testReceiving": "string",
}));`,
  'TypeTaskStow.ts': `import * as t from "ts-interface-checker";

export * from './TypeTask';

export const TypeTaskStow = t.intersection("TypeTask", t.iface([], {
  "testStow": "string",
}));`,
};

describe('ValidatorsGenerator', () => {
  let generator: ValidatorsGenerator;

  beforeEach(() => {
    generator = new ValidatorsGenerator({ config: [] });

    fsExtra.copySync(
      path.resolve(__dirname, 'source/validators'),
      path.resolve(__dirname, 'tmp/validators')
    );
  });

  afterEach(() => {
    fsExtra.emptydirSync(path.resolve(__dirname, 'tmp'));
  });

  const folder = path.resolve(__dirname, 'tmp/validators/api');
  const triggerFolder = path.resolve(__dirname, 'tmp/validators/models');

  const targetFolder = path.resolve(__dirname, 'tmp/api');
  const targetFolderModels = path.resolve(__dirname, 'tmp/models');
  const targetFolderModelsTasks = path.resolve(__dirname, 'tmp/models/tasks');

  function checkResultFiles({
    headerTemplate = '',
    files = {
      root: ['getUser.ts', 'getUserExtended.ts'],
      models: ['tasks', 'TypeRole.ts', 'TypeTaskStatus.ts', 'TypeUser.ts', 'TypeUserExtended.ts'],
      tasks: ['TypeTask.ts', 'TypeTaskAny.ts', 'TypeTaskReceiving.ts', 'TypeTaskStow.ts'],
    },
  }: {
    headerTemplate?: string;
    files?: {
      root: Array<string>;
      models: Array<string>;
      tasks: Array<string>;
    };
  }) {
    /**
     * Check api folder content
     *
     */

    const filesApi = generator.getFilteredChildren({ folder: targetFolder });

    expect(filesApi.names).to.deep.equal(files.root);

    filesApi.names.forEach((fileName, index) => {
      const filePath = filesApi.paths[index];
      const content = fs.readFileSync(filePath, fileEncoding);

      expect(content).to.equal(`${headerTemplate}${resultContent[fileName]}`);
    });

    /**
     * Check models folder content
     *
     */

    const filesModels = generator.getFilteredChildren({ folder: targetFolderModels });

    expect(filesModels.names).to.deep.equal(files.models);

    filesModels.names.forEach((fileName, index) => {
      if (fileName === 'tasks') return;

      const filePath = filesModels.paths[index];
      const content = fs.readFileSync(filePath, fileEncoding);

      expect(content).to.equal(`${headerTemplate}${resultContent[fileName]}`);
    });

    /**
     * Check models/tasks folder content
     *
     */

    const filesModelsTasks = generator.getFilteredChildren({ folder: targetFolderModelsTasks });

    expect(filesModelsTasks.names).to.deep.equal(files.tasks);

    filesModelsTasks.names.forEach((fileName, index) => {
      const filePath = filesModelsTasks.paths[index];
      const content = fs.readFileSync(filePath, fileEncoding);

      expect(content).to.equal(`${headerTemplate}${resultContent[fileName]}`);
    });
  }

  it('creates validators', () => {
    const headerTemplate = '// some-comment\n\n';

    generator = new ValidatorsGenerator({
      config: [{ folder, targetFolder, headerTemplate }],
    });

    generator.generate({});

    checkResultFiles({ headerTemplate });

    /**
     * Try to create validators
     *
     */

    const filesApi = generator.getFilteredChildren({ folder: targetFolder });

    filesApi.paths.forEach((filePath) => {
      expect(() => createCheckers(require(filePath).default)).to.not.throw();
    });
  });

  it('creates validators when model changed', () => {
    generator = new ValidatorsGenerator({ config: [{ folder, targetFolder }] });
    generator.generate({});

    checkResultFiles({});

    /**
     * Modify TypeUser
     *
     */

    const userModelContent = fs.readFileSync(
      path.resolve(triggerFolder, 'TypeUser.ts'),
      fileEncoding
    );

    fs.writeFileSync(
      path.resolve(triggerFolder, 'TypeUser.ts'),
      userModelContent.replace('email: string', 'email: number'),
      fileEncoding
    );

    generator = new ValidatorsGenerator({ config: [{ folder, targetFolder }] });
    generator.generate({});

    /**
     * Check regenerated validator
     *
     */

    const userContent = fs.readFileSync(
      path.resolve(targetFolderModels, 'TypeUser.ts'),
      fileEncoding
    );

    expect(userContent).to.equal(
      resultContent['TypeUser.ts'].replace(`"email": "string",`, `"email": "number",`)
    );
  });

  it('removes not existing validators', () => {
    generator = new ValidatorsGenerator({ config: [{ folder, targetFolder }] });
    generator.generate({});

    checkResultFiles({});

    generator = new ValidatorsGenerator({
      config: [{ folder: path.resolve(__dirname, 'source/validators2/api'), targetFolder }],
    });
    generator.generate({ logs: true });

    checkResultFiles({
      files: {
        root: ['getUser.ts'],
        models: ['tasks', 'TypeRole.ts', 'TypeTaskStatus.ts', 'TypeUser.ts'],
        tasks: ['TypeTask.ts', 'TypeTaskAny.ts', 'TypeTaskReceiving.ts', 'TypeTaskStow.ts'],
      },
    });
  });

  it('creates validators when included in changedFiles', () => {
    generator = new ValidatorsGenerator({
      config: [{ folder, targetFolder }],
    });
    generator.generate({ changedFiles: [path.resolve(folder, 'getUser.ts')] });

    checkResultFiles({});
  });

  it('creates validators when included in changedFiles (triggerFolder)', () => {
    generator = new ValidatorsGenerator({
      config: [{ folder, targetFolder, triggerFolder }],
    });
    generator.generate({ changedFiles: [path.resolve(triggerFolder, 'TypeRole.ts')] });

    checkResultFiles({});
  });

  it('no validators when not included in changedFiles', () => {
    generator = new ValidatorsGenerator({
      config: [{ folder, targetFolder }],
    });
    generator.generate({ changedFiles: [] });

    expect(fs.existsSync(targetFolder)).to.equal(false);
  });
});
