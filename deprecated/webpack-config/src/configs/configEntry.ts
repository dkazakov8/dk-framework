/**
 * @docs: https://webpack.js.org/configuration/entry-context
 *
 */

import webpack from 'webpack';

import { TypeConfig } from '../types';

export const configEntry: TypeConfig<webpack.Configuration['entry']> = global.entry;
