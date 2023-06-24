/**
 * @docs: https://webpack.js.org/configuration/module
 *
 */

import webpack from 'webpack';

import { TypeConfig } from '../types';
import { ruleSass } from '../rules/ruleSass';
import { ruleAudio } from '../rules/ruleAudio';
import { ruleSwc } from '../rules/ruleSwc';
import { ruleXml } from '../rules/ruleXml';
import { ruleFonts } from '../rules/ruleFonts';
import { ruleVideo } from '../rules/ruleVideo';
import { ruleImages } from '../rules/ruleImages';
import { ruleSvgInline } from '../rules/ruleSvgInline';
import { ruleSassGlobal } from '../rules/ruleSassGlobal';

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
