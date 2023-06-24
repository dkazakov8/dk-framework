import ConditionalAggregateWebpackPlugin from 'dk-conditional-aggregate-webpack-plugin';

import { TypePlugin } from '../types';

export const pluginConditionalAggregate: TypePlugin = new ConditionalAggregateWebpackPlugin({
  recheckInterval: 50, // how often do we call the condition function
  condition: global.rebuildCondition,
});
