/* eslint-disable react/jsx-no-literals */
import { observer } from 'mobx-react';
import { Component } from 'react';

import { TypeActionLog } from '../types/TypeActionLog';
import { TypeCreateContextParams } from '../types/TypeCreateContextParams';

const STYLE_PREFIX = 'ActionsLogger_';

const COLOR_FADER = 10;

// eslint-disable-next-line @typescript-eslint/naming-convention
const ActionsLoggerColumnItem = observer(
  class ActionsLoggerColumnItem extends Component<{ text: string; background: string }> {
    render() {
      const { text, background } = this.props;

      return (
        <div className={`${STYLE_PREFIX}child`} style={{ background }}>
          <span>{text}</span>
        </div>
      );
    }
  }
);

// eslint-disable-next-line @typescript-eslint/naming-convention
const ActionsLoggerColumn = observer(
  class ActionsLoggerColumn extends Component<{
    logItem: Array<TypeActionLog> | null;
  }> {
    render() {
      const { logItem } = this.props;

      if (!logItem) return null;

      const logsActions = logItem.filter(({ type }) => type === 'ACTION');
      const logsApi = logItem.filter(({ type }) => type === 'API');

      const childrenFinished = logsActions.filter(({ executionTime }) => executionTime != null);
      const childrenExecuting = logsActions.filter(({ executionTime }) => executionTime == null);

      const childrenFinishedApi = logsApi.filter(({ executionTime }) => executionTime != null);
      const childrenExecutingApi = logsApi.filter(({ executionTime }) => executionTime == null);

      return (
        <>
          {childrenFinished.map(({ name, executionTime }, childIndex) => (
            <ActionsLoggerColumnItem
              key={childIndex}
              text={executionTime ? `${name} (${executionTime}ms)` : name}
              background={`rgba(120, 14, 0, ${(childIndex + 1) / COLOR_FADER})`}
            />
          ))}
          {childrenExecuting.map(({ name, executionTime }, childIndex) => (
            <ActionsLoggerColumnItem
              key={childIndex}
              text={executionTime ? `${name} (${executionTime}ms)` : name}
              background={`rgba(31, 93, 25, ${(childIndex + 1) / COLOR_FADER})`}
            />
          ))}
          {childrenFinishedApi.map(({ name, executionTime }, childIndex) => (
            <ActionsLoggerColumnItem
              key={childIndex}
              text={executionTime ? `${name} (${executionTime}ms)` : name}
              background={`rgba(130, 74, 0, ${(childIndex + 1) / COLOR_FADER})`}
            />
          ))}
          {childrenExecutingApi.map(({ name, executionTime }, childIndex) => (
            <ActionsLoggerColumnItem
              key={childIndex}
              text={executionTime ? `${name} (${executionTime}ms)` : name}
              background={`rgba(5, 76, 158, ${(childIndex + 1) / COLOR_FADER})`}
            />
          ))}
        </>
      );
    }
  }
);

// eslint-disable-next-line @typescript-eslint/naming-convention
export const ActionsLogger = observer(
  class ActionsLogger extends Component<{
    actionsLogs: Array<Array<TypeActionLog>>;
    transformers: TypeCreateContextParams['transformers'];
  }> {
    localState: { highlightedLog: Array<TypeActionLog> } = this.props.transformers.observable({
      highlightedLog: [],
    });

    handleClearData = () => {
      const { actionsLogs, transformers } = this.props;

      transformers.batch(() => {
        actionsLogs.splice(0, actionsLogs.length);
        this.localState.highlightedLog = [];
      });
    };

    handleSetHighlightedLogIndex = (highlightedLog: Array<TypeActionLog>) => () => {
      const { transformers } = this.props;

      transformers.batch(() => (this.localState.highlightedLog = highlightedLog));
    };

    get groupsByRoute() {
      const { actionsLogs } = this.props;

      const groupsByRoute: Record<string, typeof actionsLogs> = {};

      actionsLogs.forEach((items, i) => {
        const routeName = items[0].routeName;
        const prevRouteName = actionsLogs[i - 1]?.[0].routeName;

        const lastKey = Object.keys(groupsByRoute)
          .reverse()
          .find((key) => key.includes(routeName));

        if (!lastKey) {
          groupsByRoute[`${routeName}-0`] = [items];
        } else if (routeName === prevRouteName) {
          groupsByRoute[lastKey].push(items);
        } else {
          const key = `${routeName}-${Number(lastKey.split('-')[1]) + 1}`;

          if (!groupsByRoute[key]) groupsByRoute[key] = [items];
          else groupsByRoute[key].push(items);
        }
      });

      return groupsByRoute;
    }

    render() {
      return (
        <div className={`${STYLE_PREFIX}wrapper`}>
          {this.localState.highlightedLog.length > 0 && (
            <div className={`${STYLE_PREFIX}bar`}>
              <ActionsLoggerColumn logItem={this.localState.highlightedLog} />
            </div>
          )}
          <div className={`${STYLE_PREFIX}clear`} onClick={this.handleClearData}>
            Clear
          </div>
          {Object.entries(this.groupsByRoute).map(([routeName, logs], groupIndex) => {
            return (
              <div className={`${STYLE_PREFIX}group`} key={groupIndex}>
                <div className={`${STYLE_PREFIX}groupItems`}>
                  {logs.map((actionLog, index) => (
                    <div
                      key={index}
                      className={`${STYLE_PREFIX}item`}
                      onMouseEnter={this.handleSetHighlightedLogIndex(actionLog)}
                    >
                      <ActionsLoggerColumn logItem={actionLog} />
                    </div>
                  ))}
                </div>
                <div className={`${STYLE_PREFIX}groupTitle`}>{routeName}</div>
              </div>
            );
          })}
        </div>
      );
    }
  }
);
