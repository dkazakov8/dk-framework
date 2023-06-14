import { Compiler } from 'webpack';

const DEFAULT_RECHECK_INTERVAL = 200;
const PLUGIN_NAME = 'WatchConditionalAggregatePlugin';

type TypeWatchFileSystem = Compiler['watchFileSystem'];

export type TypeOptions = {
  /**
   * Should return true if the webpack build is OK to be started, and a debug
   * message (as an array of strings) otherwise. The debug message will be
   * printed to console time to time; if you don't want this, just return an
   * empty array.
   */
  condition: (changes: Set<string>, removals: Set<string>) => boolean;

  /**
   * The condition function will be called not more often than this number of
   * milliseconds.
   */
  recheckInterval?: number;
};

class ConditionalAggregateFileSystem implements TypeWatchFileSystem {
  // eslint-disable-next-line no-useless-constructor
  constructor(
    private wfs: TypeWatchFileSystem,
    private condition: TypeOptions['condition'],
    private recheckInterval: number
  ) {}

  // eslint-disable-next-line max-params
  watch: TypeWatchFileSystem['watch'] = (
    files,
    dirs,
    missing,
    startTime,
    options,
    callback,
    callbackInstant
  ) => {
    let changes = new Set<string>();
    let removals = new Set<string>();
    let timeout: ReturnType<typeof setTimeout> | undefined;

    const condition = this.condition;
    const recheckInterval = this.recheckInterval;

    const watcher = this.wfs.watch(
      files,
      dirs,
      missing,
      startTime,
      options,
      // eslint-disable-next-line max-params
      function cb(err, fileTimestamps, dirTimestamps, changedFiles, removedFiles) {
        const runCallback = () => {
          if (timeout) {
            clearTimeout(timeout);
            timeout = undefined;
          }

          if (err) {
            // @ts-ignore
            callback(err);
            return;
          }

          const watchInfo = watcher.getInfo!();

          const hasAggregatedChanges = (Array.from(watchInfo.changes) as Array<string>).some(
            (file) => !changes.has(file)
          );
          const hasAggregatedRemovals = (Array.from(watchInfo.removals) as Array<string>).some(
            (file) => !removals.has(file)
          );

          if (hasAggregatedChanges || hasAggregatedRemovals) {
            cb(
              undefined,
              watchInfo.fileTimeInfoEntries,
              watchInfo.contextTimeInfoEntries,
              watchInfo.changes,
              watchInfo.removals
            );

            return;
          }

          const conditionResult = condition(changes, removals);

          if (conditionResult) {
            const copyChanges = changes;
            const copyRemovals = removals;
            changes = new Set();
            removals = new Set();
            callback(err, fileTimestamps, dirTimestamps, copyChanges, copyRemovals);
          } else {
            timeout = setTimeout(runCallback, recheckInterval);
          }
        };

        if (!err) {
          changedFiles.forEach((file) => changes.add(file));
          removedFiles.forEach((file) => removals.add(file));
        }

        runCallback();
      },
      callbackInstant
    );

    return watcher;
  };
}

// eslint-disable-next-line import/no-default-export
export default class ConditionalAggregateWebpackPlugin {
  // eslint-disable-next-line no-useless-constructor
  constructor(private options: TypeOptions) {}

  apply(compiler: Compiler) {
    const { condition, recheckInterval } = this.options;

    compiler.hooks.afterEnvironment.tap(PLUGIN_NAME, () => {
      compiler.watchFileSystem = new ConditionalAggregateFileSystem(
        compiler.watchFileSystem,
        condition,
        recheckInterval || DEFAULT_RECHECK_INTERVAL
      );
    });
  }
}
