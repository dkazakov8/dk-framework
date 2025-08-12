/**
 * @docs: https://webpack.js.org/configuration/module
 *
 */

import webpack from 'webpack';

import { ruleAudio } from '../rules/ruleAudio';
import { ruleFonts } from '../rules/ruleFonts';
import { ruleImages } from '../rules/ruleImages';
import { ruleSass } from '../rules/ruleSass';
import { ruleSassGlobal } from '../rules/ruleSassGlobal';
import { ruleSvgInline } from '../rules/ruleSvgInline';
import { ruleSwc } from '../rules/ruleSwc';
import { ruleVideo } from '../rules/ruleVideo';
import { ruleXml } from '../rules/ruleXml';
import { TypeConfig } from '../types';

export const configModule: TypeConfig<webpack.Configuration['module']> = {
  rules: [
    ruleSass,
    ruleAudio,
    ruleSwc,
    ruleFonts,
    ruleVideo,
    ruleXml,
    ruleImages,
    ruleSvgInline,
    ruleSassGlobal,
  ],
};
