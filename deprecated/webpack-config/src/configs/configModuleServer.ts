/**
 * @docs: https://webpack.js.org/configuration/module
 *
 */

import webpack from 'webpack';

import { ruleFontsServer } from '../rules/ruleFontsServer';
import { ruleImagesServer } from '../rules/ruleImagesServer';
import { ruleSassServer } from '../rules/ruleSassServer';
import { ruleSvgInline } from '../rules/ruleSvgInline';
import { ruleSwcServer } from '../rules/ruleSwcServer';
import { ruleVideoServer } from '../rules/ruleVideoServer';
import { TypeConfig } from '../types';

export const configModuleServer: TypeConfig<webpack.Configuration['module']> = {
  rules: [
    ruleSvgInline,
    ruleSassServer,
    ruleSwcServer,
    ruleFontsServer,
    ruleVideoServer,
    ruleImagesServer,
  ],
};
