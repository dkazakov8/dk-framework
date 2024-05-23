import { observer } from 'mobx-react-lite';

const Error = observer((props: { errorCode: number }) => {
  return `Error ${props.errorCode}`;
});

// eslint-disable-next-line import/no-default-export
export default Error;
