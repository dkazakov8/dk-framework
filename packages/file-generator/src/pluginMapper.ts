import { TypeGeneratorPlugin, TypePluginName } from './types';
import * as pluginTheme from './plugins/theme';
import * as pluginReexport from './plugins/reexport';
import * as pluginValidators from './plugins/validators';
import * as pluginReexportModular from './plugins/reexport-modular';

export const pluginMapper: Record<TypePluginName, TypeGeneratorPlugin<any>> = {
  [pluginTheme.pluginName]: pluginTheme.generateTheme,
  [pluginReexport.pluginName]: pluginReexport.generateReexport,
  [pluginValidators.pluginName]: pluginValidators.generateValidators,
  [pluginReexportModular.pluginName]: pluginReexportModular.generateReexportModular,
};
